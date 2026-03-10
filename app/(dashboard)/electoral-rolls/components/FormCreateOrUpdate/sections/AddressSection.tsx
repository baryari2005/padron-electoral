"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { useFormContext, UseFormReturn } from "react-hook-form";
import { ElectoralRollFormValues } from "../../../lib";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { UppercaseInput } from "@/components/ui/uppercaseInput";
import { FormCombobox } from "@/app/(dashboard)/components/FormsCreate";

interface Props {
  control: UseFormReturn<ElectoralRollFormValues>["control"];
  modo?: "ver" | "editar";
}

export function AddressSection({ control, modo }: Props) {
  const isReadOnly = modo === "ver";
  const { watch, setValue } = useFormContext<ElectoralRollFormValues>();
  const selectedEstablecimientoId = watch("establecimientoId");

  const [establecimientos, setEstablecimientos] = useState<
    {
      id: number;
      nombre: string;
      circuitoId: number;
      circuito?: { id: number; nombre: string; codigo: string };
    }[]
  >([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const res = await axiosInstance.get(
        "/api/establishments?all=true&includeCircuito=true"
      );
      setEstablecimientos(res.data.items);
    };

    fetchOptions();
  }, []);

  // 🔁 Cuando cambia el establecimiento → setear circuito automáticamente
  useEffect(() => {
    const est = establecimientos.find(
      (e) => String(e.id) === String(selectedEstablecimientoId)
    );

    if (est?.circuitoId) {
      setValue("circuitoId", est.circuitoId);
    }
  }, [selectedEstablecimientoId, establecimientos, setValue]);

  const selectedEst = establecimientos.find(
    (e) => String(e.id) === String(selectedEstablecimientoId)
  );

  const circuitosFiltrados = selectedEst?.circuito
    ? [selectedEst.circuito]
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* DOMICILIO */}
      <FormField
        control={control}
        name="domicilio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Domicilio</FormLabel>
            <FormControl>
              <UppercaseInput {...field} disabled={isReadOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* LOCALIDAD */}
      <FormField
        control={control}
        name="localidad"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Localidad</FormLabel>
            <FormControl>
              <UppercaseInput {...field} disabled={isReadOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* CODIGO POSTAL */}
      <FormField
        control={control}
        name="codigoPostal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código Postal</FormLabel>
            <FormControl>
              <UppercaseInput {...field} disabled={isReadOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* DISTRITO */}
      <FormField
        control={control}
        name="distrito"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Distrito</FormLabel>
            <FormControl>
              <UppercaseInput {...field} disabled={isReadOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* SECCION */}
      <FormField
        control={control}
        name="seccion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sección</FormLabel>
            <FormControl>
              <UppercaseInput {...field} disabled={isReadOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ESTABLECIMIENTO + CIRCUITO EN MISMA FILA */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ESTABLECIMIENTO */}
        <FormField
          control={control}
          name="establecimientoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Establecimiento</FormLabel>
              <FormControl>
                <FormCombobox
                  value={String(field.value ?? "")}
                  onChange={(val) => field.onChange(Number(val))}
                  options={establecimientos}
                  getOptionLabel={(e) => e.nombre}
                  getOptionValue={(e) => String(e.id)}
                  disabled={isReadOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CIRCUITO */}
        <FormField
          control={control}
          name="circuitoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Circuito</FormLabel>
              <FormControl>
                <FormCombobox
                  value={String(field.value ?? "")}
                  onChange={(val) => field.onChange(Number(val))}
                  options={circuitosFiltrados}
                  getOptionLabel={(c) =>
                    `${c.codigo ?? ""} - ${c.nombre}`
                  }
                  getOptionValue={(c) => String(c.id)}
                  disabled={true} // normalmente circuito es automático
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}