"use client";

import { useState } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  isEdit?: boolean;
};

export function PasswordField<T extends FieldValues>({ control, name, isEdit }: Props<T>) {
  const [show, setShow] = useState(false);
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Contraseña {isEdit && <span className="text-muted-foreground">(dejar vacío para no cambiar)</span>}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input placeholder="Contraseña..." type={show ? "text" : "password"} {...field} />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
