"use client";

import { Establecimiento } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { formatMessage } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FormCombobox } from "../../components/FormsCreate";
import { Loader2, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import { Elector, Mesa, PendingMark } from "./components/types";
import { useVoteStream } from "./components/useVoteStream";
import { buildColumns } from "./components/columns";
import { GenericDataTable, GenericListWithTable } from "../../components";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";

// 👉 Tabs de shadcn
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VoterSeatMap, type VoterSeat } from "./components/VoterSeatMap";
import { IconAzul, IconRojo, IconVerde } from "./components/icons/VoterIcons";
import { cn } from "@/lib/utils";
import { Cargando } from "@/components/ui/upload";

type FormValues = { establecimientoId: string; mesaId: string; query: string };

export default function ElectoralQuickMarkingPage() {
  const form = useForm<FormValues>({ defaultValues: { establecimientoId: "", mesaId: "", query: "" } });
  const establecimientoId = form.watch("establecimientoId");
  const mesaId = form.watch("mesaId");
  const query = form.watch("query");

  const canList = Boolean(establecimientoId && mesaId);
  const canView = useHasPermission("ver_estadoelector");
  const canEdit = useHasPermission("editar_estadoelector");

  // ⛔ (ANTES estaba el return acá; lo movemos abajo) // ✅ FIX

  // catálogos
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(false);

  // lote
  const [pendingMarks, setPendingMarks] = useState<PendingMark[]>([]);
  const hasPending = pendingMarks.length > 0;

  // grilla (mesa)
  const [mesaVoters, setMesaVoters] = useState<VoterSeat[]>([]);
  const [loadingMesa, setLoadingMesa] = useState(false);

  const [loadingEstabs, setLoadingEstabs] = useState(true);   // 👈 nuevo
  const [loadingMesas, setLoadingMesas] = useState(false);

  // UI: cuál tab está activa
  const [view, setView] = useState<"grid" | "table">("grid");

  // UI: sectores visibles (izquierda/derecha) para la grilla
  const COLUMNS = 14;
  const [leftOn, setLeftOn] = useState(true);
  const [rightOn, setRightOn] = useState(true);
  const visibleColumns = useMemo(() => {
    const s = new Set<number>();
    for (let c = 0; c < COLUMNS; c++) {
      const isLeft = c < COLUMNS / 2;
      if ((isLeft && leftOn) || (!isLeft && rightOn)) s.add(c);
    }
    return s;
  }, [leftOn, rightOn]);

  // reload trigger
  const [refreshToken, setRefreshToken] = useState(0);

  /** pendingMap */
  const pendingMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const m of pendingMarks) map.set(String(m.electorId), m.voted);
    return map;
  }, [pendingMarks]);

  function upsertPending(electorId: string, voted: boolean) {
    setPendingMarks((prev) => {
      const id = String(electorId);
      const i = prev.findIndex((x) => String(x.electorId) === id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { electorId: id, voted };
        return next;
      }
      return [...prev, { electorId: id, voted }];
    });
  }

  function Field({ label, children, className = "" }: {
    label: string; children: React.ReactNode; className?: string;
  }) {
    return (
      <div className={`min-w-0 ${className}`}>
        <Label className="block text-sm font-medium leading-5 mb-4 mt-2 whitespace-nowrap">
          {label}
        </Label>
        <div className="grid gap-2">
          {children}
        </div>
      </div>
    );
  }

  /** Prefetch establecimientos */
  useEffect(() => {
    if (!canView) return; // ✅ FIX: guardamos por permiso
    (async () => {
      try {
        setLoadingEstabs(true);
        const { data } = await axiosInstance.get("/api/establishments?all=true");
        setEstablecimientos(data.items ?? data);
      } catch {
        toast.error(formatMessage("No se pudieron cargar los establecimientos"));
      } finally {
        setLoadingEstabs(false);
      }
    })();
  }, [canView]); // ✅ FIX: depende de canView

  /** Cargar mesas al seleccionar establecimiento */
  useEffect(() => {
    if (!canView) return; // ✅ FIX
    if (!establecimientoId) {
      setMesas([]);
      form.setValue("mesaId", "");
      return;
    }
    (async () => {
      try {
        setLoadingMesas(true);
        const { data } = await axiosInstance.get(`/api/electoral-rolls/mesas?establecimientoId=${establecimientoId}`);
        setMesas(data.items ?? data);
      } catch {
        toast.error(formatMessage("No se pudieron cargar las mesas"));
      } finally {
        setLoadingMesas(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView, establecimientoId]); // ✅ FIX

  /** SSE */
  useVoteStream(
    canView ? mesaId : "", // ✅ FIX: evito suscribirme si no puede ver
    (payload) => {
      if (payload?.type === "vote-changed") setRefreshToken((x) => x + 1);
    }
  );

  /** Guardar / Descartar */
  const handleGuardarCambios = async () => {
    if (!pendingMarks.length) return;
    try {
      await axiosInstance.post("/api/electoral-rolls/votes/batch", {
        mesaId: mesaId || null,
        changes: pendingMarks,
      });
      setPendingMarks([]);
      toast.success("Cambios guardados");
      setRefreshToken((x) => x + 1);
    } catch {
      toast.error("No se pudieron guardar los cambios");
      setRefreshToken((x) => x + 1);
    }
  };
  const handleDescartarCambios = () => {
    setPendingMarks([]);
    setRefreshToken((x) => x + 1);
    toast.message("Cambios descartados");
  };

  /** Filtros para la tabla / búsqueda global */
  const filters = useMemo(() => {
    const arr: { key: string; value: string }[] = [];
    if (query) arr.push({ key: "q", value: query });
    if (establecimientoId) arr.push({ key: "establecimientoId", value: establecimientoId });
    if (mesaId) arr.push({ key: "mesaId", value: mesaId });
    return arr;
  }, [establecimientoId, mesaId, query]);

  /** Columnas tabla */
  const columns = useMemo(
    () => buildColumns(pendingMap, (electorId, nextVoted) => upsertPending(electorId, nextVoted)),
    [pendingMap]
  );

  /** Traer votantes de la mesa (para la grilla) */
  useEffect(() => {
    if (!canView || !canList) {
      setMesaVoters([]);
      return;
    }
    (async () => {
      setLoadingMesa(true);
      try {
        const params: any = {
          page: 1,
          limit: 400,
          establecimientoId,
          mesaId,
        };
        const q = (query ?? "").trim();
        if (q) params.q = q;          // 👈 aplicar filtro también en la grilla

        const { data } = await axiosInstance.get("/api/electoral-rolls/quick-search", { params });

        const items = data.items ?? [];
        items.sort((a: any, b: any) => {
          const ap = (a.apellido ?? "").localeCompare(b.apellido ?? "", "es", { sensitivity: "base" });
          if (ap !== 0) return ap;
          return (a.nombre ?? "").localeCompare(b.nombre ?? "", "es", { sensitivity: "base" });
        });

        const mapped: VoterSeat[] = items.map((e: any, idx: number) => ({
          id: e.id,
          position: Number(e.numeroOrden ?? idx + 1),
          apellido: e.apellido,
          nombre: e.nombre,
          votedAt: e.votedAt,
          votoSiNo: e.votoSiNo,
        }));
        setMesaVoters(mapped);
      } catch {
        toast.error("No se pudieron cargar los votantes de la mesa");
      } finally {
        setLoadingMesa(false);
      }
    })();
    // 👇 mantené refreshToken (Enter/Botón) para disparar la búsqueda
  }, [canView, canList, establecimientoId, mesaId, refreshToken, query]);


  // ✅ FIX: ahora recién acá corto la UI, después de haber llamado TODOS los hooks
  if (!canView) {
    return <AccessDeniedPage subtitle="Ver Electores que votaron." />;
  }

  return (
    <Form {...form}>
      <div className="space-y-4">
        {/* Header + acciones */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">Marcación rápida de voto</h1>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleDescartarCambios} disabled={!hasPending}>
              Descartar
            </Button>
            <Button onClick={handleGuardarCambios} disabled={!hasPending || !canEdit}>
              Guardar cambios{hasPending ? ` (${pendingMarks.length})` : ""}
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="p-4"> {/* 👈 sin space-y */}
          {/* fila de combos */}
          <div className="grid gap-3 md:grid-cols-3 items-start mb-2 md:mb-3">
            {/* Establecimiento */}
            <FormField
              control={form.control}
              name="establecimientoId"
              render={({ field }) => (
                <div className="min-w-0">
                  <Label className="block text-sm font-medium leading-5 mb-1">Establecimiento</Label>
                  <FormCombobox
                    label=""
                    value={field.value}
                    onChange={(v: string) => {
                      field.onChange(v);
                      form.setValue("mesaId", "");
                      setPendingMarks([]);
                      setRefreshToken((x) => x + 1);
                    }}
                    options={establecimientos}
                    getOptionLabel={(e: Establecimiento) => e.nombre}
                    getOptionValue={(e: Establecimiento) => String(e.id)}
                    loading={loadingEstabs}
                    disabled={loadingEstabs}
                    placeholder={loadingEstabs ? "Cargando…" : "Seleccionar"}
                  />
                </div>
              )}
            />

            {/* Mesa */}
            <FormField
              control={form.control}
              name="mesaId"
              render={({ field }) => (
                <div className="min-w-0">
                  <Label className="block text-sm font-medium leading-5 mb-1">Mesa</Label>
                  <FormCombobox
                    label=""
                    value={field.value}
                    onChange={(v: string) => {
                      field.onChange(v);
                      setPendingMarks([]);
                      setRefreshToken((x) => x + 1);
                    }}
                    options={mesas}
                    getOptionLabel={(m: Mesa) => `Mesa ${m.numero}`}
                    getOptionValue={(m: Mesa) => String(m.id)}
                    disabled={!establecimientoId || loadingMesas}
                    loading={loadingMesas}
                    placeholder={
                      !establecimientoId ? "Seleccionar establecimiento primero"
                        : loadingMesas ? "Cargando…"
                          : "Seleccionar"
                    }
                  />
                </div>
              )}
            />

            {/* Búsqueda manual */}
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <div className="min-w-0">
                  <Label className="block text-sm font-medium leading-5 mb-1">Búsqueda manual</Label>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      placeholder="Apellido, Nombre o DNI"
                      onKeyDownCapture={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") {                          
                          setRefreshToken((x) => x + 1);
                        }
                      }}
                    />
                    <Button
                      onClick={() => {                        
                        setRefreshToken((x) => x + 1);
                      }}
                      disabled={loading}
                    >
                      <Search width={20} height={20} />
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                    </Button>
                  </div>
                </div>
              )}
            />
          </div>

          {/* separador pegadito */}
          <Separator className="my-1 md:my-2" />   {/* 👈 controla el aire exacto */}

          {/* ayuda debajo con poco margen */}
          <div className="text-sm text-muted-foreground mt-1 md:mt-2">
            Elegí Establecimiento y Mesa para ver la grilla; o usá la búsqueda para listar globalmente.
          </div>
        </Card>


        {/* Tabs: Grilla / Tabla */}
        <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <IconVerde className="h-5 w-5" />
                    Votó
                  </span>
                  <span className="flex items-center gap-2">
                    <IconRojo className="h-5 w-5" />
                    No votó
                  </span>
                  <span className="flex items-center gap-2">
                    <IconAzul className="h-5 w-5" />
                    Pendiente (sin guardar)
                  </span>
                </div>
              </p>
              <TabsList className="gap-2">
                <TabsTrigger value="grid" disabled={!canList}>Grilla</TabsTrigger>
                <TabsTrigger value="table" disabled={!(canList || query)}>Tabla</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* GRILLA */}
          <TabsContent value="grid">
            {canList && (
              <Card className="relative p-4 space-y-3">
                {/* contenedor de la grilla: reservamos alto mientras carga */}
                <div className={cn("relative", loadingMesa && "min-h-[300px]")}>
                  <VoterSeatMap
                    voters={mesaVoters}
                    pendingMap={pendingMap}
                    onToggle={(id, next) => upsertPending(String(id), next)}
                    columns={14}
                    visibleColumns={visibleColumns}
                    size={30}
                    iconSize={20}
                    icons={{ verde: IconVerde, rojo: IconRojo, azul: IconAzul }}
                  />
                </div>

                {/* OVERLAY que cubre TODO el Card */}
                {loadingMesa && (
                  <Cargando label="Cargando datos..." />
                )}
              </Card>
            )}
          </TabsContent>

          {/* TABLA */}
          <TabsContent value="table">
            {(canList || query) ? (
              <Card className="p-4 space-y-3">
                <GenericListWithTable
                  key={`dt-${establecimientoId}-${mesaId}-${query}-${refreshToken}`}
                  endpoint="/api/electoral-rolls/quick-search"
                  columns={columns}
                  filters={filters}
                  externalSearch={query}
                  refreshToken={refreshToken}
                  pageSize={10}
                  DataTableComponent={(props: any) => (
                    <GenericDataTable
                      {...props}
                      searchPlaceholder="Filtrar por apellido, nombre o matrícula del votante..."
                    />
                  )}
                />
              </Card>
            )
              : (
                <Card className="p-8 text-center text-muted-foreground">
                  <p>Escribí en la búsqueda o seleccioná filtros para ver la tabla.</p>
                </Card>
              )}
          </TabsContent>
        </Tabs>
      </div >
    </Form >
  );
}
