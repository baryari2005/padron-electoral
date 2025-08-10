"use client";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface FiltersGridProps {
  localidades: string[];
  circuitos: { id: number; nombre: string }[];
  establecimientos: { id: number; nombre: string }[];
  onFilterChange: (key: "localidad" | "circuitoId" | "establecimientoId", value: string) => void;
}

export function FiltersGrid({
  localidades,
  circuitos,
  establecimientos,
  onFilterChange,
}: FiltersGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* Localidad */}
      <Select onValueChange={(val) => onFilterChange("localidad", val)}>
        <SelectTrigger className="w-full border rounded-md text-sm bg-background shadow-none">
          <SelectValue placeholder="Filtrar por Localidad" />
        </SelectTrigger>
        <SelectContent>
          {localidades.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {loc}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Circuito */}
      <Select onValueChange={(val) => onFilterChange("circuitoId", val)}>
        <SelectTrigger className="w-full border rounded-md text-sm bg-background shadow-none">
          <SelectValue placeholder="Filtrar por Circuito" />
        </SelectTrigger>
        <SelectContent>
          {circuitos.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Establecimiento */}
      <Select onValueChange={(val) => onFilterChange("establecimientoId", val)}>
        <SelectTrigger className="w-full border rounded-md text-sm bg-background shadow-none">
          <SelectValue placeholder="Filtrar por Establecimiento" />
        </SelectTrigger>
        <SelectContent>
          {establecimientos.map((e) => (
            <SelectItem key={e.id} value={String(e.id)}>
              {e.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
