"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cargando } from "@/components/ui/upload";
import { Loader2 } from "lucide-react";
import { Control } from "react-hook-form";

interface Option {
  label: string;
  value: string;
}

interface Props {
  control: Control<any>;
  name: string;
  label: string;
  options: Option[];
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function FormSelectField({
  control,
  name,
  label,
  options,
  placeholder = "Seleccioná una opción",
  loading = false,
  disabled = false,
}: Props) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            value={String(field.value) || ""}            
            onValueChange={(value) => {
              console.log("📦 Valor seleccionado:", value);
              field.onChange(Number(value))}
            }              
            disabled={disabled || loading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {loading ? (
                <Cargando label="Cargando..."/>
              ) : (
                options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
