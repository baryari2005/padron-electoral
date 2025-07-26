"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useEffect, useState } from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
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
  disabled,
}: MesaSelectorProps) {
  const [escuelas, setEscuelas] = useState<EstablecimientoConCircuito[]>([]);
  const [open, setOpen] = useState(false);

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
          <FormCombobox
            label="Escuela / Establecimiento"
            value={String(field.value)} 
            onChange={(v) => field.onChange(v)} 
            options={escuelas}
            getOptionLabel={(e) => e.nombre}
            getOptionValue={(e) => String(e.id)} 
            onOptionSelected={(establecimiento) => {
              if (establecimiento){
                setValue("mesa.circuitoId", String(establecimiento.circuito.id));
              }
              onEscuelaSeleccionada?.(establecimiento);
            }
            }
            disabled={disabled}
          />           
        )}          
      />

      {/* Campo de número de mesa */}
      <FormField
        control={control}
        name="mesa.numeroMesa"
        render={({ field }: { field: ControllerRenderProps<CertificadoFormData, "mesa.numeroMesa"> }) => (
          <FormItem className="min-h-[100px]">
            <FormLabel className="block text-xs text-left mt-1 uppercase">
              Número de Mesa
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ej: 134" type="text" disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
