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
}

export function MesaVotoSection({ control }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="numero_mesa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Mesa</FormLabel>
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
        name="orden_mesa"
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
        name="voto_sino"
        render={({ field }) => (
          <FormItem>
            <FormLabel>¿Votó?</FormLabel>
            <FormControl>
              <select {...field} className="w-full border rounded-md p-2 text-sm">
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
        name="tipo_ejemplar"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Ejemplar</FormLabel>
            <FormControl>
              <UppercaseInput {...field}/>
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
              <UppercaseInput {...field}/>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
