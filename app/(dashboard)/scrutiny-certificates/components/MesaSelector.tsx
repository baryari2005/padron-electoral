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
import { Input } from "@/components/ui/input"; // si preferís el input de shadcn
import { FormCombobox } from "../../components/FormsCreate"; // ← tu combo nuevo
import { FormCombo } from "../../components/FormsCreate/FormCombo";

interface MesaSelectorProps {
  control: UseFormReturn<CertificadoFormData>["control"];
  setValue: UseFormReturn<CertificadoFormData>["setValue"];
  onEscuelaSeleccionada?: (establecimiento: EstablecimientoConCircuito) => void;
  disabled?: boolean;
}

export function MesaSelector({
  control,
  setValue,
  onEscuelaSeleccionada,
  disabled,
}: MesaSelectorProps) {
  const [escuelas, setEscuelas] = useState<EstablecimientoConCircuito[]>([]);
  const [escuelaSeleccionada, setEscuelaSeleccionada] =
    useState<EstablecimientoConCircuito | null>(null);
  const [mesasDisponibles, setMesasDisponibles] = useState<{ numero: number }[]>(
    []
  );

  const [loadingEstabs, setLoadingEstabs] = useState(true);   // 👈 nuevo
  const [loadingMesas, setLoadingMesas] = useState(false);

  useEffect(() => {
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
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[68%_30%] gap-4 md:gap-x-6 md:px-1 items-start">
      {/* ESCUELA */}
      <FormField
        control={control}
        name="mesa.escuelaId"
        render={({ field }) => {
          const triggerId = "escuela-escuelaId-trigger";
          const labelId = "escuela-escuelaId-label";
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
                    if (establecimiento?.circuito?.id) {
                      setValue("mesa.circuitoId", String(establecimiento.circuito.id));
                    }
                    setValue("mesa.numeroMesa", "");
                    setEscuelaSeleccionada(establecimiento);
                    onEscuelaSeleccionada?.(establecimiento);
                    try {
                      setLoadingMesas(true);
                      const res = await axiosInstance.get(
                        `/api/establishments/${establecimiento.id}/available-tables`
                      );
                      const mesasFiltradas = res.data.items.filter(
                        (m: any) => !m.escrutada
                      );
                      setMesasDisponibles(mesasFiltradas);
                    } catch (err) {
                      console.error("Error al cargar mesas disponibles", err);
                    } finally {
                      setLoadingMesas(false);
                    }
                  }}
                  loading={loadingEstabs}
                  disabled={loadingEstabs}
                  placeholder={loadingEstabs ? "Cargando…" : "Seleccionar"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* NÚMERO DE MESA */}
      <FormField
        control={control}
        name="mesa.numeroMesa"
        render={({ field }) => {
          const triggerId = "escuela-nromesa-trigger";
          const labelId = "escuela-nromesa-label";

          if (disabled) {
            // Solo lectura: mantené accesibilidad con label htmlFor + id del input
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
                    !escuelaSeleccionada ? "Seleccionar establecimiento primero"
                      : loadingMesas ? "Cargando…"
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
