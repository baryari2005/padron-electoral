// components/Header/ElectoralRollHeader.tsx

"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { GenericFiltersGrid } from "@/app/(dashboard)/components";

interface ElectoralRollHeaderProps {
  onFiltersChange: (filters: {
    localidad?: string;
    circuitoId?: number;
    establecimientoId?: number;
  }) => void;
}

export function ElectoralRollHeader({
  onFiltersChange,
}: ElectoralRollHeaderProps) {
  const [localidades, setLocalidades] = useState<string[]>([]);
  const [circuitos, setCircuitos] = useState<{ id: number; nombre: string }[]>(
    []
  );
  const [establecimientos, setEstablecimientos] = useState<
    { id: number; nombre: string }[]
  >([]);

  const [selectedFilters, setSelectedFilters] = useState<{
    localidad?: string;
    circuitoId?: number;
    establecimientoId?: number;
  }>({});

  const filtersConfig = [
    {
      key: "localidad",
      label: "Localidad",
      options: localidades.map((loc) => ({ id: loc, nombre: loc })),
      isNumber: false,
    },
    {
      key: "circuitoId",
      label: "Circuito",
      options: circuitos,
      isNumber: true,
    },
    {
      key: "establecimientoId",
      label: "Establecimiento",
      options: establecimientos,
      isNumber: true,
    },
  ];

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

  const handleFilterChange = (
    key: string,
    value: string | number | undefined
  ) => {
    const isNumber = filtersConfig.find((f) => f.key === key)?.isNumber;

    const parsedValue =
      value === "" || value === undefined
        ? undefined
        : isNumber
        ? Number(value)
        : value;

    const updated = {
      ...selectedFilters,
      [key]: parsedValue,
    };
    setSelectedFilters(updated);
    onFiltersChange(updated);
  };

  return (
    <GenericFiltersGrid
      filters={filtersConfig}
      selected={selectedFilters}
      onFilterChange={handleFilterChange}
    />
  );
}
