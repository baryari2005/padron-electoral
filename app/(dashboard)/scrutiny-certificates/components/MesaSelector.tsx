"use client";

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { FormCombo } from "../../components/FormsCreate/FormCombo";

interface MesaSelectorProps {
  control: UseFormReturn<CertificadoFormData>["control"];
  setValue: UseFormReturn<CertificadoFormData>["setValue"];
  onEscuelaSeleccionada?: (establecimiento: EstablecimientoConCircuito) => void;
  disabled?: boolean;
  /** Si viene, NO se carga la lista de escuelas; se usa esta fija */
  fixedEscuela?: EstablecimientoConCircuito | null;
  /** Alternativa si sólo tenés el ID; también evita cargar la lista completa */
  fixedEscuelaId?: number | string;
}

export function MesaSelector({
  control,
  setValue,
  onEscuelaSeleccionada,
  disabled,
  fixedEscuela,
  fixedEscuelaId,
}: MesaSelectorProps) {
  const locked = !!fixedEscuela || !!fixedEscuelaId;

  // Solo se usa en modo libre
  const [escuelas, setEscuelas] = useState<EstablecimientoConCircuito[]>([]);
  const [loadingEstabs, setLoadingEstabs] = useState(!locked);

  const [escuelaSeleccionada, setEscuelaSeleccionada] =
    useState<EstablecimientoConCircuito | null>(null);
  const [mesasDisponibles, setMesasDisponibles] = useState<{ numero: number }[]>([]);
  const [loadingMesas, setLoadingMesas] = useState(false);

  /** Carga mesas disponibles para una escuela (filtra no escrutadas) */
  const loadMesasDisponibles = async (establecimientoId: number | string) => {
    try {
      setLoadingMesas(true);
      const res = await axiosInstance.get(
        `/api/establishments/${establecimientoId}/available-tables`
      );
      const mesasFiltradas = res.data.items.filter((m: any) => !m.escrutada);
      setMesasDisponibles(mesasFiltradas);
    } catch (err) {
      console.error("Error al cargar mesas disponibles", err);
      setMesasDisponibles([]);
    } finally {
      setLoadingMesas(false);
    }
  };

  /** Aplica escuela al form + estado + callback + mesas */
  const applyEscuela = async (establecimiento: EstablecimientoConCircuito | null) => {
    if (!establecimiento) return;
    if (escuelaSeleccionada?.id === establecimiento.id) return; // evita re-aplicar

    setValue("mesa.escuelaId", String(establecimiento.id), { shouldDirty: true });
    const circuitoId = establecimiento.circuito?.id ?? establecimiento.circuito.id;
    if (circuitoId) {
      setValue("mesa.circuitoId", String(circuitoId), { shouldDirty: true });
    }
    if (!disabled) {
      // resetear número de mesa al cambiar escuela
      setValue("mesa.numeroMesa", "", { shouldDirty: true });
      await loadMesasDisponibles(establecimiento.id);
    }
    setEscuelaSeleccionada(establecimiento);
    onEscuelaSeleccionada?.(establecimiento);
  };

  /** MODO BLOQUEADO: usar escuela fija (objeto o fetch por id); NO cargar lista */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!locked) return;

      if (fixedEscuela) {
        if (mounted) await applyEscuela(fixedEscuela);
        return;
      }

      if (fixedEscuelaId) {
        try {
          const { data } = await axiosInstance.get<EstablecimientoConCircuito>(
            `/api/establishments/${fixedEscuelaId}`
          );
          if (mounted) await applyEscuela(data);
        } catch (e) {
          console.error("No se pudo cargar la escuela fija por id:", e);
        }
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, fixedEscuela, fixedEscuelaId]);

  /** MODO LIBRE: cargar lista de escuelas solo si NO hay fija */
  useEffect(() => {
    if (locked) return; // no cargar lista
    (async () => {
      try {
        setLoadingEstabs(true);
        const res = await axiosInstance.get("/api/establishments?all=true");
        setEscuelas(res.data.items);
      } catch (err) {
        console.error("Error al cargar escuelas", err);
      } finally {
        setLoadingEstabs(false);
      }
    })();
  }, [locked]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[68%_30%] gap-4 md:gap-x-6 md:px-1 items-start">
      {/* ===== ESCUELA ===== */}
      <FormField
        control={control}
        name="mesa.escuelaId"
        render={({ field }) => {
          const triggerId = "escuela-escuelaId-trigger";
          const labelId = "escuela-escuelaId-label";

          // --- MODO BLOQUEADO: no combobox, solo lectura ---
          if (locked) {
            return (
              <FormItem>
                <FormLabel id={labelId} htmlFor="escuela-readonly">
                  Escuela / Establecimiento
                </FormLabel>
                <FormControl>
                  <Input
                    id="escuela-readonly"
                    value={escuelaSeleccionada?.nombre ?? ""}
                    disabled
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }

          // --- MODO LIBRE: combobox normal ---
          return (
            <FormItem>
              <FormLabel id={labelId} htmlFor={triggerId}>
                Escuela / Establecimiento
              </FormLabel>
              <FormControl>
                <FormCombo<EstablecimientoConCircuito>
                  id={triggerId}
                  labelId={labelId}
                  value={String(field.value ?? "")}
                  onChange={(v) => field.onChange(v)}
                  options={escuelas}
                  getOptionLabel={(e) => e.nombre}
                  getOptionValue={(e) => String(e.id)}
                  onOptionSelected={async (establecimiento) => {
                    if (disabled) return;
                    await applyEscuela(establecimiento);
                  }}
                  loading={loadingEstabs}
                  disabled={loadingEstabs || !!disabled}
                  placeholder={loadingEstabs ? "Cargando…" : "Seleccionar"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* ===== NÚMERO DE MESA ===== */}
      <FormField
        control={control}
        name="mesa.numeroMesa"
        render={({ field }) => {
          const triggerId = "escuela-nromesa-trigger";
          const labelId = "escuela-nromesa-label";

          if (disabled) {
            return (
              <FormItem>
                <FormLabel id={labelId} htmlFor="nro-mesa-readonly">
                  Número de Mesa
                </FormLabel>
                <FormControl>
                  <Input
                    id="nro-mesa-readonly"
                    value={`${field.value ?? ""}`}
                    disabled
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }

          return (
            <FormItem>
              <FormLabel id={labelId} htmlFor={triggerId}>
                Número de Mesa
              </FormLabel>
              <FormControl>
                <FormCombo<{ numero: number }>
                  id={triggerId}
                  labelId={labelId}
                  value={String(field.value ?? "")}
                  onChange={(v) => field.onChange(v)}
                  options={mesasDisponibles}
                  getOptionLabel={(m) => `Mesa ${m.numero}`}
                  getOptionValue={(m) => String(m.numero)}
                  disabled={!escuelaSeleccionada || loadingMesas}
                  loading={loadingMesas}
                  placeholder={
                    !escuelaSeleccionada
                      ? "Seleccionar establecimiento primero"
                      : loadingMesas
                        ? "Cargando…"
                        : "Seleccionar"
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
}
