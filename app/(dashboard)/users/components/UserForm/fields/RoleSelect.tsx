"use client";

import { Control, FieldPath, FieldValues, useController } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rol } from "@prisma/client";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  roles: Rol[];
  label?: string;
};

export function RoleSelect<T extends FieldValues>({ control, name, roles, label = "Rol" }: Props<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select value={String(field.value ?? "")} onValueChange={(v) => field.onChange(Number(v))}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná un rol" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
