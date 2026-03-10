"use client";

import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { ChevronsUpDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props<T> {
  id?: string;
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
  loading = false,
}: Props<T>) {
  const [open, setOpen] = useState(false);

  const fallbackId = useId();
  const triggerId = id ?? `combobox-${fallbackId}`;
  const listboxId = `listbox-${fallbackId}`;

  const selectedOption = useMemo(
    () => options.find((opt) => getOptionValue(opt) === value),
    [options, value, getOptionValue]
  );

  return (
    <Popover
      open={loading ? false : open}
      onOpenChange={setOpen}
      modal={false}
    >
      <PopoverTrigger asChild>
        <Button
          id={triggerId}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-labelledby={labelId}
          disabled={disabled || loading}
          className="w-full h-10 px-3 justify-between"
        >
          {/* CONTENIDO INTERNO — UN SOLO NODO */}
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span className="truncate text-muted-foreground animate-pulse">
                    {placeholder || "Cargando..."}
                  </span>
                </>
              ) : value && selectedOption ? (
                <span className="truncate">
                  {getOptionLabel(selectedOption)}
                </span>
              ) : (
                <span className="truncate text-muted-foreground">
                  {placeholder}
                </span>
              )}
            </div>

            <ChevronsUpDown
              className={cn(
                "h-4 w-4 shrink-0 opacity-50 transition-transform",
                open && "rotate-180"
              )}
            />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="z-[70] p-0 w-[--radix-popover-trigger-width]"
        align="start"
        side="bottom"
        sideOffset={2}
      >
        <Command>
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
                      className={cn(
                        "ml-auto h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
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
  );
}