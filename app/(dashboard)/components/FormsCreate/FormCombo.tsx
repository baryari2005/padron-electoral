"use client";

import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props<T> {
  /** ID del botón/trigger para enlazar con <label htmlFor> */
  id?: string;
  /** ID del <label> externo, para aria-labelledby del input de búsqueda */
  labelId?: string;

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

export function FormCombo<T>({
  id,
  labelId,
  placeholder = "Seleccionar",
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  onOptionSelected,
  disabled = false,
}: Props<T>) {
  const [open, setOpen] = useState(false);

  // IDs accesibles
  const fallbackId = useId(); // por si no pasan `id`
  const triggerId = id ?? `combobox-${fallbackId}`;
  const listboxId = `listbox-${fallbackId}`;

  const selectedOption = useMemo(
    () => options.find((opt) => getOptionValue(opt) === value),
    [options, value, getOptionValue]
  );

  return (
    <>
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            id={triggerId}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-labelledby={labelId} // enlaza con el <label id="...">
            disabled={disabled}
            className="w-full justify-between h-10 px-3"
          >
            <span className="truncate max-w-[90%] text-left">
              {value
                ? selectedOption
                  ? getOptionLabel(selectedOption)
                  : placeholder
                : placeholder}
            </span>
            <ChevronsUpDown className="opacity-50 h-4 w-4 ml-2 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="z-[70] p-0 w-[--radix-popover-trigger-width] pointer-events-auto"
          align="start"
          side="bottom"
          sideOffset={2}
          avoidCollisions={false}
          collisionPadding={8}
        >
          <Command>
            {/* Importante: etiquetar el input de búsqueda */}
            <CommandInput
              disabled={disabled}
              placeholder="Buscar…"
              className="h-9"
              aria-labelledby={labelId}
            />
            <CommandList id={listboxId} role="listbox">
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {options.map((opt) => {
                  const optValue = getOptionValue(opt);
                  const optLabel = getOptionLabel(opt);
                  const isSelected = value === optValue;

                  return (
                    <CommandItem
                      key={optValue}
                      value={optLabel}
                      role="option"
                      aria-selected={isSelected}
                      onSelect={() => {
                        onChange(optValue);
                        onOptionSelected?.(opt);
                        setOpen(false);
                      }}
                    >
                      {optLabel}
                      <Check
                        className={cn("ml-auto h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
