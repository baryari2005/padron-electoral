"use client";

import {
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FormComboboxProps<T> {
  label: string;
  placeholder?: string;
  options: T[];
  value?: string;
  onChange: (value: string) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  onOptionSelected?: (option: T) => void;
  disabled?: boolean;
}

export function FormCombobox<T>({
  label,
  placeholder = "Seleccionar",
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  onOptionSelected,
  disabled = false
}: FormComboboxProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <FormItem className="self-end min-h-[100px]">
      <FormLabel className="block text-xs text-left mt-1 uppercase">
        {label}
      </FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between h-10" // altura fija
          >
            {value
              ? getOptionLabel(
                options.find((opt) => getOptionValue(opt) === value)!
              )
              : placeholder}
            <ChevronsUpDown className="opacity-50 h-4 w-4 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          side="bottom"
          sideOffset={2}
          avoidCollisions={false}
          collisionPadding={8}
        >
          <Command>
            <CommandInput
              disabled={disabled}
              placeholder={`Buscar ${label.toLowerCase()}...`}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {options.map((opt) => {
                  const optValue = getOptionValue(opt);
                  const optLabel = getOptionLabel(opt);
                  return (
                    <CommandItem
                      key={optValue}
                      value={optLabel}
                      onSelect={() => {
                        onChange(optValue);
                        onOptionSelected?.(opt);
                        setOpen(false);
                      }}
                    >
                      {optLabel}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === optValue ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage /> {/* espacio reservado */}
    </FormItem>
  );
}
