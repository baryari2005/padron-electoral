"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiltersGrid } from "@/app/(dashboard)/components/FilterGrid";

interface ElectoralRollHeaderProps {
  onElectoralRollCreated: () => void;
  onSearchChange: (query: string) => void;
  onFiltersChange: (filters: {
    localidad?: string;
    circuitoId?: number;
    establecimientoId?: number;
  }) => void;
}

export function ElectoralRollHeader({
  onElectoralRollCreated,
  onSearchChange,
  onFiltersChange,
}: ElectoralRollHeaderProps) {
  const [localidades, setLocalidades] = useState<string[]>([]);
  const [circuitos, setCircuitos] = useState<{ id: number; nombre: string }[]>([]);
  const [establecimientos, setEstablecimientos] = useState<{ id: number; nombre: string }[]>([]);

  const [selectedFilters, setSelectedFilters] = useState<{
    localidad?: string;
    circuitoId?: number;
    establecimientoId?: number;
  }>({});

  const fetchFilterOptions = async () => {
    try {
      const [res1, res2, res3] = await Promise.all([
        axiosInstance.get("/api/localities"),
        axiosInstance.get("/api/circuites"),
        axiosInstance.get("/api/establishments"),
      ]);

      setLocalidades(res1.data.localidades);
      setCircuitos(res2.data.circuites);
      setEstablecimientos(res3.data.establishments);
    } catch (err) {
      console.error("Error cargando filtros:", err);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const handleFilterChange = (key: keyof typeof selectedFilters, value: string) => {
    const updated = {
      ...selectedFilters,
      [key]: key === "localidad" ? value : Number(value),
    };
    setSelectedFilters(updated);
    onFiltersChange(updated);
  };

  return (
    <FiltersGrid
      localidades={localidades}
      circuitos={circuitos}
      establecimientos={establecimientos}
      onFilterChange={handleFilterChange}
    />
  );
}
