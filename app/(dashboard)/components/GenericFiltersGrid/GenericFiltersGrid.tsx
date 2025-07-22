// components/GenericFiltersGrid.tsx

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface FilterOption {
  id: string | number;
  nombre: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  isNumber?: boolean; // ← Esto permite convertir automáticamente si hace falta
}

interface GenericFiltersGridProps {
  filters: FilterConfig[];
  selected: Record<string, string | number | undefined>;
  onFilterChange: (key: string, value: string | number | undefined) => void;
}

export function GenericFiltersGrid({
  filters,
  selected,
  onFilterChange,
}: GenericFiltersGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {filters.map(({ key, label, options, isNumber }) => (
        <div key={key}>
          <label className="block mb-1 font-medium">{label}</label>
          <Select
            value={selected[key]?.toString() ?? "__all__"}
            onValueChange={(val) => {
              const parsedValue =
                val === "__all__" ? undefined
                  : isNumber ? Number(val)
                    : val;
              onFilterChange(key, parsedValue);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {options.map((opt) => (
                <SelectItem key={opt.id} value={opt.id.toString()}>
                  {opt.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>
      ))}
    </div>
  );
}
