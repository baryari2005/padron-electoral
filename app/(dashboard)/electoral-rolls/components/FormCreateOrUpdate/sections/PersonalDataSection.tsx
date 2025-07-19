"use client";

import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Control } from "react-hook-form";
import { ElectoralRollFormValues } from "../../../lib";
import { UppercaseInput } from "@/components/ui/uppercaseInput";

interface Props {
  control: Control<ElectoralRollFormValues>;
  isEdit?: boolean;
}

export function PersonalDataSection({ control, isEdit }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="numero_matricula"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Matrícula (DNI)</FormLabel>
            <FormControl>
              <Input
                placeholder="123456789"
                inputMode="numeric"
                className="text-center tracking-[0.5em] px-4 py-2 border border-input rounded-md shadow-sm caret-transparent"
                disabled={isEdit}
                {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="apellido"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Apellido</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="GONZÁLEZ"
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="nombre"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="MARÍA LUZ"
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="clase"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Clase (año de nacimiento)</FormLabel>
            <FormControl>
              <Input
                inputMode="numeric"
                className="text-center tracking-[0.5em] px-4 py-2 border border-input rounded-md shadow-sm caret-transparent"
                {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="genero"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Género</FormLabel>
            <FormControl>
              <UppercaseInput {...field} placeholder="M / F / X" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="tipo_nacionalidad"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nacionalidad</FormLabel>
            <FormControl>
              <UppercaseInput {...field} placeholder="ARGENTINA" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}