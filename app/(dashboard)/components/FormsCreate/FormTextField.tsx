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
  onchange?: (value: string) => void;
  uppercase?: boolean; // <- nueva prop
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
              onChange={(e) => {
                const value = uppercase ? e.target.value.toUpperCase() : e.target.value;
                field.onChange(value);
                onchange?.(value);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
