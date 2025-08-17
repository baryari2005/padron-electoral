"use client";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control } from "react-hook-form";

interface Props {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
   onchange?: (value: string | number | undefined) => void; 
  uppercase?: boolean; // <- nueva prop
  min?: number;
  step?: number;
}

export function FormTextField({
  control,
  name,
  label,
  placeholder,
  type = "text",
  disabled = false,
  onchange,
  uppercase = false, // <- valor por defecto
  min,
  step,
}: Props) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder || label}
              type={type}
              disabled={disabled}
              value={field.value || ""}
              min={type === "number" ? min : undefined}
              step={type === "number" ? step : undefined}
              onChange={(e) => {
                if (type === "number") {
                  const raw = e.target.value;
                  const next =
                    raw === "" ? undefined : Number(raw); // "" -> undefined | "12" -> 12
                  field.onChange(next);
                  onchange?.(next);
                } else {
                  const value = uppercase ? e.target.value.toUpperCase() : e.target.value;
                  field.onChange(value);
                  onchange?.(value);
                }
              }}
              onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()} // evita scroll cambiando números
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
