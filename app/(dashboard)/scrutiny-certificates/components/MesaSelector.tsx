"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import axiosInstance from "@/utils/axios";
import { CertificadoFormData } from "../utils/schema";

type Establecimiento = {
  id: string;
  nombre: string;
};

interface MesaSelectorProps {
  control: UseFormReturn<CertificadoFormData>["control"];
}

export default function MesaSelector({ control }: MesaSelectorProps) {
  const [escuelas, setEscuelas] = useState<Establecimiento[]>([] as Establecimiento[]);

  useEffect(() => {
    const fetchEscuelas = async () => {
      try {
        const res = await axiosInstance.get("/api/establishments");
        setEscuelas(res.data.establishments); // ajustá si el campo es diferente
      } catch (err) {
        console.error("Error al cargar escuelas", err);
      }
    };

    fetchEscuelas();
  }, []);




  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={control}
        name="mesa.escuelaId"
        render={({ field }: { field: ControllerRenderProps<CertificadoFormData, "mesa.escuelaId"> }) => (
          <FormItem>
            <FormLabel className="block text-xs text-left mt-1 uppercase">Escuela / Establecimiento</FormLabel>
            <Select
              value={field.value || ""}
              onValueChange={(value) => {
                console.log("✔️ Escuela seleccionada:", value); // <== ACÁ
                field.onChange(value);
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue>
                    {escuelas.find((e) => String(e.id) === String(field.value))?.nombre || "Seleccionar escuela"}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {escuelas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="mesa.numeroMesa"
        render={({ field }: { field: ControllerRenderProps<CertificadoFormData, "mesa.numeroMesa"> }) => (
          <FormItem>
            <FormLabel className="block text-xs text-left mt-1 uppercase">Número de Mesa</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ej: 134" type="text" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
