"use client";

import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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
import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type FormComboboxProps<T> = {
  id?: string;
  label?: string;
  withLabel?: boolean;
  placeholder?: string;
  options: T[];
  value?: string;
  onChange: (value: string) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  onOptionSelected?: (option: T) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  buttonClassName?: string;
  emptyText?: string;
  searchPlaceholder?: string;
};

export function FormCombobox<T>({
  id,
  label,
  withLabel = true,
  placeholder = "Seleccionar",
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  onOptionSelected,
  disabled = false,
  loading = false,
  className = "",
  buttonClassName = "",
  emptyText = "No se encontraron resultados.",
  searchPlaceholder,
}: FormComboboxProps<T>) {
  const [open, setOpen] = useState(false);

  const reactId = useId();
  const baseId = id ?? `cb-${reactId}`;
  const triggerId = `${baseId}-trigger`;
  const labelId = `${baseId}-label`;
  const listId = `${baseId}-listbox`;

  const selectedOption = useMemo(
    () => options.find((opt) => getOptionValue(opt) === value),
    [options, value, getOptionValue]
  );

  const computedSearchPlaceholder =
    searchPlaceholder ?? `Buscar ${label ? label.toLowerCase() : "opción"}...`;

  return (
    <FormItem className={cn("self-end min-h-[100px]", className)}>
      {withLabel && !!label ? (
        <FormLabel id={labelId} htmlFor={triggerId} className="block text-xs text-left mt-1">
          {label}
        </FormLabel>
      ) : null}

      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            id={triggerId}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-labelledby={withLabel && label ? `${labelId} ${triggerId}` : triggerId}
            disabled={disabled || loading}
            className={cn("w-full justify-between h-10 px-3", buttonClassName)}
          >
            <span className="truncate max-w-[90%] text-left">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando...
                </span>
              ) : value ? (
                selectedOption ? getOptionLabel(selectedOption) : `Seleccionar ${label ?? ""}`
              ) : (
                placeholder
              )}
            </span>
            <ChevronsUpDown className="opacity-50 h-4 w-4 ml-2 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={2}
          avoidCollisions={false}
          collisionPadding={8}
          className="pointer-events-auto z-[120] p-0 w-[--radix-popover-trigger-width] overflow-hidden"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <Command>
            <CommandInput
              disabled={disabled || loading}
              placeholder={computedSearchPlaceholder}
              className="h-9"
            />

            {/* 👇 ÚNICO contenedor con scroll */}
            <CommandList
              id={listId}
              aria-labelledby={withLabel && label ? labelId : undefined}
              className="max-h-72 overflow-y-auto overscroll-contain"
            >
              {loading ? (
                <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando opciones...
                </div>
              ) : (
                <>
                  <CommandEmpty>{emptyText}</CommandEmpty>

                  {/* sin overflow acá */}
                  <CommandGroup>
                    {options.map((opt) => {
                      const optValue = getOptionValue(opt);
                      const optLabel = getOptionLabel(opt);
                      const selected = value === optValue;

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
                              selected ? "opacity-100" : "opacity-0"
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
