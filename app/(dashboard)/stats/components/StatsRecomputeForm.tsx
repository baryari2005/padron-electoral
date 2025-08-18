// app/(dashboard)/stats/components/StatsRecomputeForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Cargando } from "@/components/ui/upload";
import { CircleFadingArrowUp, Timer, Database, FolderTree, Table, UsersRound, ClipboardList } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// ——— Types
type Result = {
  mesaStatsRows: number;
  establecimientoStatsRows: number;
  circuitoStatsRows: number;
  padronTotal: number;
  mesasTotales: number;
  durationMs: number;
};

// ——— Tiny helpers
const fmt = (n: number) => n.toLocaleString();
const seconds = (ms: number) => (ms / 1000).toFixed(2);

// ——— Reusable KPI card
function KpiCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        {icon ? <div className="opacity-60">{icon}</div> : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
      </CardContent>
    </Card>
  );
}

export default function StatsRecomputeForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/stats/recompute", { method: "POST" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Error");
      setResult(json.result as Result);
      toast.success("Estadísticas recalculadas");
    } catch (e: any) {
      toast.error(e.message || "No se pudo recalcular");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Acción */}
      <div className="rounded-xl border bg-card p-6 shadow space-y-6">
        <div className="space-y-2">
          <Label>Obtiene los datos ya importados y genera resúmenes listos para consultar.</Label>
        </div>

        <div className="space-y-2">
          <Button onClick={run} disabled={loading} className="w-full">
            <CircleFadingArrowUp className="w-5 h-5 mr-2" />
            {loading ? (
              <Cargando variant="inline" labelSize="text-sm" label="Ejecutando estadísticas" />
            ) : (
              "Ejecutar"
            )}
          </Button>
        </div>
      </div>

      {/* Dashboard de resultado */}
      {result && (
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow">
          <div className="space-y-2">      
            <Label className="text-sm-plus flex"><ClipboardList className="w-4 h-4 mr-2"/>Resultados obtenidos...</Label>
          </div>
          <Separator/>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <KpiCard
              title="Padrón total"
              value={fmt(result.padronTotal)}
              icon={<UsersRound className="w-4 h-4" />}
              subtitle="Electores en padrón."
            />
            <KpiCard
              title="Mesas totales"
              value={fmt(result.mesasTotales)}
              icon={<Table className="w-4 h-4" />}
            />
            <KpiCard
              title="Filas Mesa - Stats"
              value={fmt(result.mesaStatsRows)}
              subtitle="Mesas cargadas"
              icon={<Database className="w-4 h-4" />}
            />
            <KpiCard
              title="Filas Establecimiento - Stats"
              value={fmt(result.establecimientoStatsRows)}
              subtitle="Establecimientos cargados"
              icon={<FolderTree className="w-4 h-4" />}
            />
            <KpiCard
              title="Duración"
              value={`${seconds(result.durationMs)} s`}
              subtitle={`${fmt(result.durationMs)} ms`}
              icon={<Timer className="w-4 h-4" />}
            />
          </div>

          {/* Detalle compacto */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Detalle de ejecución</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
                <div className="text-muted-foreground">Padrón total</div>
                <div className="font-medium tabular-nums">{fmt(result.padronTotal)}</div>

                <div className="text-muted-foreground">Mesas totales</div>
                <div className="font-medium tabular-nums">{fmt(result.mesasTotales)}</div>

                <div className="text-muted-foreground">MesaStats</div>
                <div className="font-medium tabular-nums">{fmt(result.mesaStatsRows)}</div>

                <div className="text-muted-foreground">EstablecimientoStats</div>
                <div className="font-medium tabular-nums">{fmt(result.establecimientoStatsRows)}</div>

                <div className="text-muted-foreground">CircuitoStats</div>
                <div className="font-medium tabular-nums">{fmt(result.circuitoStatsRows)}</div>

                <div className="text-muted-foreground">Duración</div>
                <div className="font-medium tabular-nums">{seconds(result.durationMs)} s</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
