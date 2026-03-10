"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  control: Control<any>;
  modo?: string;
}

export function AsignacionesSection({ control, modo }: Props) {
  const [referentes, setReferentes] = useState<any[]>([]);
  const [planilleros, setPlanilleros] = useState<any[]>([]);
  const [choferes, setChoferes] = useState<any[]>([]);
  const [planillas, setPlanillas] = useState<any[]>([]);

  const isReadOnly = modo === "ver";

  useEffect(() => {
    const fetchData = async () => {
      const [personasRes, planillasRes] = await Promise.all([
        axiosInstance.get("/api/operational_person?all=true"),
        axiosInstance.get("/api/spreadsheet?all=true"),
      ]);

      const personas = personasRes.data.items;

      setReferentes(personas.filter((p: any) => p.tipo === "REFERENTE"));
      setPlanilleros(personas.filter((p: any) => p.tipo === "PLANILLERO"));
      setChoferes(personas.filter((p: any) => p.tipo === "CHOFER"));
      setPlanillas(planillasRes.data.items);
    };

    fetchData();
  }, []);

  const renderSelect = (name: string, label: string, options: any[], getOptionLabel?: (opt: any) => string) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={(val) => field.onChange(val ? Number(val) : null)}
            value={field.value ? String(field.value) : ""}
            disabled={isReadOnly}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="__none__">Sin asignar</SelectItem>
              {options.map((opt) => (
                <SelectItem key={opt.id} value={String(opt.id)}>
                   {getOptionLabel ? getOptionLabel(opt) : opt.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {renderSelect("referenteId", "Referente", referentes)}
      {renderSelect("planilleroId", "Planillero", planilleros)}
      {renderSelect("choferId", "Chofer", choferes)}
      {renderSelect("planillaId", "Planilla", planillas, (opt) =>
        opt.nombre?.trim()
          ? `${opt.numero} - ${opt.nombre}`
          : `Planilla ${opt.numero}`
      )}
    </div>
  );
}