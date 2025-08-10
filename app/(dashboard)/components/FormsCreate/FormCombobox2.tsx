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
import { ChevronsUpDown, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FormCombobox2Props<T> {
  label: string;
  placeholder?: string;
  options: T[];
  value?: string;
  onChange: (value: string) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  onOptionSelected?: (option: T) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function FormCombobox2<T>({
  label,
  placeholder = "Seleccionar",
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  onOptionSelected,
  disabled = false,
  loading = false,
}: FormCombobox2Props<T>) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((opt) => getOptionValue(opt) === value);

  return (
    <FormItem className="self-end min-h-[100px] disabled:true">
      <FormLabel className="block text-xs text-left mt-1">
        {label}
      </FormLabel>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || loading}
            className="w-full justify-between h-10"
          >
            {loading ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando...
              </span>
            ) : selectedOption ? (
              <span className="truncate block max-w-[calc(100%-1.5rem)]">
                {getOptionLabel(selectedOption)}
              </span>
            ) : (
              placeholder
            )}
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
              {loading ? (
                <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando opciones...
                </div>
              ) : (
                <>
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
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <FormMessage />
    </FormItem>
  );
}
