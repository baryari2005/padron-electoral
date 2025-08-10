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
import { UppercaseInput } from "@/components/ui/uppercaseInput";

interface Props {
  control: UseFormReturn<ElectoralRollFormValues>["control"];
  modo?: "ver" | "editar";
}

export function MesaVotoSection({ control, modo = "editar" }: Props) {
  const isReadOnly = modo === "ver";
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="numeroMesa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Mesa</FormLabel>
            <FormControl>
              <Input
                inputMode="numeric"
                className="text-center tracking-[0.5em] px-4 py-2 border border-input rounded-md shadow-sm caret-transparent"                
                disabled = {isReadOnly}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="ordenMesa"
        disabled = {isReadOnly}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Orden en la Mesa</FormLabel>
            <FormControl>
              <Input
                inputMode="numeric"
                className="text-center tracking-[0.5em] px-4 py-2 border border-input rounded-md shadow-sm caret-transparent"                
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="votoSiNo"
        disabled = {isReadOnly}
        render={({ field }) => (
          <FormItem>
            <FormLabel>¿Votó?</FormLabel>
            <FormControl>
              <select {...field} className="w-full border rounded-md p-2 text-sm" disabled = {isReadOnly}>
                <option value="SI">Sí</option>
                <option value="NO">No</option>
              </select>
            </FormControl>
            <FormMessage />            
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="tipoEjemplar"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Ejemplar</FormLabel>
            <FormControl>
              <UppercaseInput {...field} disabled = {isReadOnly}/>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="distrito"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Distrito</FormLabel>
            <FormControl>
              <UppercaseInput {...field} disabled = {isReadOnly}/>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
