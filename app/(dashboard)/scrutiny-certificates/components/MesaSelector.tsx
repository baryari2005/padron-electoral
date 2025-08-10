"use client";

import {
  FormField,
} from "@/components/ui/form";

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import axiosInstance from "@/utils/axios";
import { CertificadoFormData } from "../utils/schema";
import { EstablecimientoConCircuito } from "./types";
import { FormCombobox } from "../../components/FormsCreate";


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
  disabled
}: MesaSelectorProps) {
  const [escuelas, setEscuelas] = useState<EstablecimientoConCircuito[]>([]);
  const [escuelaSeleccionada, setEscuelaSeleccionada] = useState<EstablecimientoConCircuito | null>(null);
  const [mesasDisponibles, setMesasDisponibles] = useState<{ numero: number }[]>([]);

  useEffect(() => {
    const fetchEscuelas = async () => {
      try {
        const res = await axiosInstance.get("/api/establishments?all=true");

        setEscuelas(res.data.items);
      } catch (err) {
        console.error("Error al cargar escuelas", err);
      }
    };

    fetchEscuelas();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[68%_30%] gap-4 md:gap-x-6 md:px-1 items-start">
      {/* Combo con búsqueda */}
      <FormField
        control={control}
        name="mesa.escuelaId"
        render={({ field }) => (
          <FormCombobox<EstablecimientoConCircuito>
            label="Escuela / Establecimiento"
            value={String(field.value)}
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
                const res = await axiosInstance.get(`/api/establishments/${establecimiento.id}/available-tables`);
                const mesasFiltradas = res.data.items.filter((m: any) => !m.escrutada);
                setMesasDisponibles(mesasFiltradas);
              } catch (err) {
                console.error("Error al cargar mesas disponibles", err);
              }
            }
            }
            disabled={disabled}
          />
        )}
      />

      <FormField
        control={control}
        name="mesa.numeroMesa"
        render={({ field }) => {
          if (disabled) {
            return (
              <div className="flex flex-col gap-2">
                <label className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block text-xs text-left mt-1 uppercase">Número de Mesa</label>
                <input
                  value={`${field.value}`}
                  disabled
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
              </div>
            );
          }

          return (
            <FormCombobox
              label="Número de Mesa"
              value={String(field.value)}
              onChange={(v) => field.onChange(v)}
              options={mesasDisponibles}
              getOptionLabel={(m) => `Mesa ${m.numero}`}
              getOptionValue={(m) => String(m.numero)}
              disabled={!escuelaSeleccionada}
            />
          );
        }}
      />
    </div>
  );
}
