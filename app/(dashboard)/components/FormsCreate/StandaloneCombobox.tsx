// components/FormsCreate/StandaloneCombobox.tsx
"use client";

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
import { Label } from "@/components/ui/label";

interface StandaloneComboboxProps<T> {
  label: string;
  placeholder?: string;
  options: T[];
  value?: string;
  onChange: (value: string) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  onOptionSelected?: (option: T) => void;
  disabled?: boolean;
  withLabel?: boolean;
}

export function StandaloneCombobox<T>({
  label,
  placeholder = "Seleccionar",
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  onOptionSelected,
  disabled = false,
  withLabel = true,
}: StandaloneComboboxProps<T>) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((opt) => getOptionValue(opt) === value);

  return (
    <div>
      {withLabel ? <Label className="block mb-1 font-medium">{label}</Label> : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between h-10"
          >
            <span className="truncate max-w-[90%] text-left">
              {value
                ? selectedOption
                  ? getOptionLabel(selectedOption)
                  : "Todos"
                : placeholder}
            </span>
            <ChevronsUpDown className="opacity-50 h-4 w-4 ml-2 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
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
    </div>
  );
}
