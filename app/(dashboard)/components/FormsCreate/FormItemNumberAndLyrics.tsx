"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { useEffect, useState } from "react";
import { numberToWordsEs } from "@/utils/numberAndLyrics"; // ✅ Usando tu función local

type Props<T extends FieldValues> = {
  control: UseFormReturn<T>["control"];
  name: FieldPath<T>;
  label: string;
  disabled?: boolean;
};

export function FormItemNumberAndLyrics<T extends FieldValues>({
  control,
  name,
  label,
  disabled = false,
}: Props<T>) {
  const value = useWatch({ control, name }) as number | undefined;
  const [enLetras, setEnLetras] = useState("");

  useEffect(() => {
    const convertValue = Number(value);

    if (!isNaN(convertValue)) {
      setEnLetras(numberToWordsEs(convertValue).toUpperCase());
    } else {
      setEnLetras("");
    }
  }, [value]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: { field: ControllerRenderProps<T, FieldPath<T>> }) => (
        <FormItem>
          <FormLabel className="block text-xs text-left mt-1 uppercase">{label}</FormLabel>
          <div className="flex gap-2">
            <FormControl>
              <Input
                type="number"
                className="w-24"
                {...field}
                onChange={(e) => {
                  const parsed = Number(e.target.value);
                  field.onChange(isNaN(parsed) ? 0 : parsed);
                }}
                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                disabled={disabled} />
            </FormControl>
            {/* <Input value={enLetras} disabled className="bg-muted" /> */}
            <div className="flex-1 bg-muted px-3 py-2 rounded-md text-[11px] text-muted-foreground">
              {enLetras}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
