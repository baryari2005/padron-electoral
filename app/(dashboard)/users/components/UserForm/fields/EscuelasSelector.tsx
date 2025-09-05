"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDown, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

type EscuelaLite = { id: number; nombre: string };

type Props = {
  label?: string;
  value: number[];                   // 0 o 1 id
  onChange: (ids: number[]) => void;
  required?: boolean;
  escuelas: EscuelaLite[];
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
};

export function EscuelasSelector({
  label,
  value,
  onChange,
  required = false,
  escuelas = [],
  loading,
  placeholder = "Seleccionar escuela…",
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const selectedId = value[0] ?? null;

  const selected = useMemo(
    () => escuelas.find((e) => e.id === selectedId) ?? null,
    [escuelas, selectedId]
  );

  const handleSelect = (id: number) => {
    onChange([id]);
    setOpen(false);
  };

  const clear = () => onChange([]);

  return (
    <div className="space-y-2">
      {label && <div className="text-sm font-medium">{label}</div>}

      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen} modal={false}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-between",
                required && !selected && "ring-1 ring-yellow-500/60"
              )}
              disabled={disabled || loading}
            >
              {loading ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando…
                </span>
              ) : (
                <>
                  <span className={cn("truncate", !selected && "text-muted-foreground")}>
                    {selected ? selected.nombre : placeholder}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                </>
              )}
            </Button>
          </PopoverTrigger>

          {!loading && (
            <PopoverContent
              className="z-50 p-0 w-[--radix-popover-trigger-width] overflow-hidden pointer-events-auto"
              side="bottom"
              align="start"
            >
              <Command>
                <CommandInput placeholder="Buscar escuela…" />
                <CommandList
                  className="max-h-64 overflow-y-auto overscroll-contain" // 👈 clave
                  onWheelCapture={(e) => e.stopPropagation()}            // 👈 bloquea burbuja
                >
                  <CommandEmpty>Sin resultados.</CommandEmpty>
                  <CommandGroup>
                    {escuelas.map((e) => {
                      const isActive = selectedId === e.id;
                      return (
                        <CommandItem
                          key={e.id}
                          value={e.nombre}
                          keywords={[e.nombre]}
                          onSelect={() => handleSelect(e.id)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isActive ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="truncate">{e.nombre}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          )}
        </Popover>

        {selected && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clear}
            aria-label="Limpiar selección"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {required && value.length === 0 && (
        <p className="text-xs text-yellow-600">
          Este rol requiere seleccionar una escuela.
        </p>
      )}
    </div>
  );
}
