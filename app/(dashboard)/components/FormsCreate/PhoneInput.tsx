"use client";

import { useState } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PHONE_COUNTRIES } from "../../lib/constants/phoneCountries";


interface PhoneInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  disabled?: boolean;
}

export function PhoneInput<T extends FieldValues>({
  control,
  name,
  label = "Teléfono",
  disabled = false,
}: PhoneInputProps<T>) {
  const [country, setCountry] = useState(PHONE_COUNTRIES[0]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const handleNumberChange = (value: string) => {
          const cleaned = value.replace(/[^\d\s-]/g, "");
          const fullNumber = cleaned
            ? `${country.dialCode} ${cleaned}`
            : "";
          field.onChange(fullNumber);
        };

        const currentNumber =
          field.value?.replace(country.dialCode, "").trim() || "";

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>

            <div className="flex gap-2">
              <Select
                value={country.code}
                onValueChange={(code) => {
                  const selected =
                    PHONE_COUNTRIES.find((c) => c.code === code)!;
                  setCountry(selected);
                  if (field.value) {
                    handleNumberChange(currentNumber);
                  }
                }}
                disabled={disabled}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue>
                    {country.flag} {country.dialCode}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {PHONE_COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.dialCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormControl>
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="11 1234-5678"
                  disabled={disabled}
                  value={currentNumber}
                  onChange={(e) =>
                    handleNumberChange(e.target.value)
                  }
                />
              </FormControl>
            </div>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}