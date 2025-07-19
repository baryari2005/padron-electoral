"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ElectoralRollFormValues } from "../../../lib";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { UppercaseInput } from "@/components/ui/uppercaseInput";

interface Props {
  control: UseFormReturn<ElectoralRollFormValues>["control"];
}

export function AddressSection({ control }: Props) {
  const [circuitos, setCircuitos] = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const [res1, res2] = await Promise.all([
        axiosInstance.get("/api/circuites"),
        axiosInstance.get("/api/establishments"),
      ]);
      setCircuitos(res1.data.circuites);
      setEstablecimientos(res2.data.establishments);
    };

    fetchOptions();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="domicilio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Domicilio</FormLabel>
            <FormControl>
              <UppercaseInput {...field}/>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="localidad"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Localidad</FormLabel>
            <FormControl>
              <UppercaseInput {...field}/>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="codigo_postal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código Postal</FormLabel>
            <FormControl>
              <UppercaseInput {...field}/>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="seccion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sección</FormLabel>
            <FormControl>
              <UppercaseInput {...field}/>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="circuitoId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Circuito</FormLabel>
            <FormControl>
              <select {...field} className="w-full border rounded-md p-2 text-sm">
                <option value="">Seleccionar circuito</option>
                {circuitos.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="establecimientoId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Establecimiento</FormLabel>
            <FormControl>
              <select {...field} className="w-full border rounded-md p-2 text-sm">
                <option value="">Seleccionar establecimiento</option>
                {establecimientos.map((e: any) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
