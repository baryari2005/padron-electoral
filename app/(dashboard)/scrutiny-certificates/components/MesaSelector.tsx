"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import axiosInstance from "@/utils/axios";
import { CertificadoFormData } from "../utils/schema";
import { EstablecimientoConCircuito } from "./types";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { FormCombo } from "../../components/FormsCreate/FormCombo";

interface MesaSelectorProps {
  control: UseFormReturn<CertificadoFormData>["control"];
  setValue: UseFormReturn<CertificadoFormData>["setValue"];
  onEscuelaSeleccionada?: (establecimiento: EstablecimientoConCircuito) => void;
  disabled?: boolean;
  fixedEscuela?: EstablecimientoConCircuito | null;
  fixedEscuelaId?: number | string;
  restrictToFixed?: boolean;
  modo?: "crear" | "editar";
}

export function MesaSelector({
  control,
  setValue,
  onEscuelaSeleccionada,
  disabled,
  fixedEscuela,
  fixedEscuelaId,
  restrictToFixed = false,
  modo = "crear",
}: MesaSelectorProps) {
  const esEdicion = modo === "editar";

  const hadFixedAtMount = useRef(Boolean(fixedEscuela || fixedEscuelaId)).current;
  const locked = restrictToFixed && hadFixedAtMount;
  const disabledEstablishment = hadFixedAtMount && !locked;

  const [escuelas, setEscuelas] = useState<EstablecimientoConCircuito[]>([]);
  const [loadingEstabs, setLoadingEstabs] = useState(!locked);
  const [escuelaSeleccionada, setEscuelaSeleccionada] =
    useState<EstablecimientoConCircuito | null>(null);

  const [mesasDisponibles, setMesasDisponibles] = useState<{ numero: number }[]>([]);
  const [loadingMesas, setLoadingMesas] = useState(false);

  const [padronTotalMesa, setPadronTotalMesa] = useState<number | null>(null);

  const lastReqId = useRef(0);

  // 👇 mirar cambios en numeroMesa
  const numeroMesaSeleccionada = useWatch({
    control,
    name: "mesa.numeroMesa",
  });

  useEffect(() => {
    if (!numeroMesaSeleccionada) {
      setPadronTotalMesa(null);
    }
  }, [numeroMesaSeleccionada]);

  // =============================
  // Cargar mesas disponibles
  // =============================
  const loadMesasDisponibles = useCallback(async (establecimientoId: number | string) => {
    if (esEdicion) return;

    const reqId = ++lastReqId.current;
    try {
      setLoadingMesas(true);
      setMesasDisponibles([]);
      setPadronTotalMesa(null);

      const res = await axiosInstance.get(
        `/api/establishments/${establecimientoId}/available-tables`
      );

      if (reqId !== lastReqId.current) return;

      const mesasFiltradas = (res.data.items ?? []).filter(
        (m: any) => !m.escrutada
      );

      setMesasDisponibles(mesasFiltradas);
    } catch (err) {
      console.error("Error al cargar mesas disponibles", err);
      setMesasDisponibles([]);
    } finally {
      if (reqId === lastReqId.current) setLoadingMesas(false);
    }
  }, [esEdicion]);

  // =============================
  // Cargar stats de mesa
  // =============================
  const loadMesaStats = async (numeroMesa: number) => {

    if (!escuelaSeleccionada || esEdicion) return;

    try {
      const res = await axiosInstance.get("/api/mesa-stats", {
        params: {
          establecimientoId: escuelaSeleccionada.id,
          numeroMesa,
        },
      });

      setPadronTotalMesa(res.data.padronTotal ?? null);
    } catch (err) {
      console.error("Error al obtener stats de mesa", err);
      setPadronTotalMesa(null);
    }
  };

  // =============================
  // Aplicar escuela seleccionada
  // =============================
  const applyEscuela = useCallback(
    async (establecimiento: EstablecimientoConCircuito | null) => {
      if (!establecimiento || esEdicion) return;
      if (escuelaSeleccionada?.id === establecimiento.id) return;

      setValue("mesa.escuelaId", String(establecimiento.id), {
        shouldDirty: true,
      });

      const circuitoId = establecimiento.circuito?.id;
      if (circuitoId) {
        setValue("mesa.circuitoId", String(circuitoId), {
          shouldDirty: true,
        });
      }

      setValue("mesa.numeroMesa", "", { shouldDirty: true });
      setPadronTotalMesa(null);

      await loadMesasDisponibles(establecimiento.id);

      setEscuelaSeleccionada(establecimiento);
      onEscuelaSeleccionada?.(establecimiento);
    },
    [
      esEdicion,
      escuelaSeleccionada,
      setValue,
      onEscuelaSeleccionada,
      loadMesasDisponibles
    ]);

  // =============================
  // Prefill escuela fija
  // =============================
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!hadFixedAtMount) return;

      if (fixedEscuela && mounted) {
        await applyEscuela(fixedEscuela);
        return;
      }

      if (fixedEscuelaId) {
        try {
          const { data } = await axiosInstance.get(
            `/api/establishments/${fixedEscuelaId}`
          );
          if (mounted) await applyEscuela(data);
        } catch (e) {
          console.error("No se pudo cargar escuela fija:", e);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [
    hadFixedAtMount,
    fixedEscuela,
    fixedEscuelaId,
    applyEscuela
  ]);

  // =============================
  // Cargar lista de escuelas
  // =============================
  useEffect(() => {
    if (locked) return;

    (async () => {
      try {
        setLoadingEstabs(true);
        const res = await axiosInstance.get(
          "/api/establishments?all=true"
        );
        setEscuelas(res.data.items ?? []);
      } catch (err) {
        console.error("Error al cargar escuelas", err);
      } finally {
        setLoadingEstabs(false);
      }
    })();
  }, [locked]);

  const escuelasOptions = useMemo(() => {
    if (locked) return escuelas;
    if (!escuelaSeleccionada) return escuelas;

    const exists = escuelas.some(
      (e) => String(e.id) === String(escuelaSeleccionada.id)
    );

    return exists ? escuelas : [escuelaSeleccionada, ...escuelas];
  }, [locked, escuelas, escuelaSeleccionada]);

  // =============================
  // RENDER
  // =============================
  return (
    <div className="grid grid-cols-1 md:grid-cols-[60%_38%] gap-4 md:gap-x-6 md:px-1 items-start">

      {/* ESCUELA */}
      <FormField
        control={control}
        name="mesa.escuelaId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Escuela / Establecimiento</FormLabel>
            <FormControl>
              <FormCombo<EstablecimientoConCircuito>
                value={String(field.value ?? "")}
                onChange={(v) => field.onChange(v)}
                options={escuelasOptions}
                getOptionLabel={(e) => e.nombre}
                getOptionValue={(e) => String(e.id)}
                onOptionSelected={async (establecimiento) => {
                  await applyEscuela(establecimiento);
                }}
                loading={loadingEstabs}
                disabled={loadingEstabs || disabledEstablishment}
                placeholder={
                  loadingEstabs ? "Cargando..." : "Seleccionar"
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* MESA */}
      <FormField
        control={control}
        name="mesa.numeroMesa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Mesa</FormLabel>
            <FormControl>
              <FormCombo<{ numero: number }>
                value={String(field.value ?? "")}
                onChange={(v) => field.onChange(v)}
                options={mesasDisponibles}
                getOptionLabel={(m) => `Mesa ${m.numero}`}
                getOptionValue={(m) => String(m.numero)}
                disabled={!escuelaSeleccionada || loadingMesas}
                loading={loadingMesas}
                onOptionSelected={async (mesa) => {
                  field.onChange(String(mesa.numero));
                  await loadMesaStats(mesa.numero);
                }}
                placeholder={
                  !escuelaSeleccionada
                    ? "Seleccionar establecimiento primero"
                    : loadingMesas
                      ? "Cargando mesas…"
                      : "Seleccionar"
                }
              />
            </FormControl>
            <FormMessage />

            {/* CAMPO TOTAL PADRÓN */}
            {!esEdicion &&
              field.value &&
              padronTotalMesa !== null && (
                <div className="mt-3 p-3 rounded-lg bg-muted text-center">
                  <p className="text-sm text-muted-foreground">
                    Total padrón mesa
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {padronTotalMesa}
                  </p>
                </div>
              )}
          </FormItem>
        )}
      />
    </div>
  );
}