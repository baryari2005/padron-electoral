"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { GenericFiltersGridWithCombo } from "@/app/(dashboard)/components";

interface ElectoralRollHeaderProps {
  onFiltersChange: (filters: {
    localidad?: string;
    circuitoId?: number;
    establecimientoId?: number;
  }) => void;
}

export function ElectoralRollHeader({ onFiltersChange }: ElectoralRollHeaderProps) {
  const [localidades, setLocalidades] = useState<string[]>([]);
  const [circuitos, setCircuitos] = useState<
    { id: number; nombre: string; codigo: string }[]
  >([]);
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
      options: [
        { id: "__all__", nombre: "Todos" },
        ...localidades.map((loc) => ({ id: loc, nombre: loc })),
      ],
      getOptionLabel: (opt: any) => opt.nombre,
      getOptionValue: (opt: any) => String(opt.id),
    },
    {
      key: "circuitoId",
      label: "Circuito",
      options: [
        { id: "__all__", nombre: "Todos", codigo: "" },
        ...circuitos,
      ],
      getOptionLabel: (opt: any) =>
        opt.codigo ? `${opt.codigo} - ${opt.nombre}` : opt.nombre,
      getOptionValue: (opt: any) => String(opt.id),
      isNumber: true,
    },
    {
      key: "establecimientoId",
      label: "Establecimiento",
      options: [
        { id: "__all__", nombre: "Todos" },
        ...establecimientos,
      ],
      getOptionLabel: (opt: any) => opt.nombre,
      getOptionValue: (opt: any) => String(opt.id),
      isNumber: true,
    },
  ];

  const fetchFilterOptions = async () => {
    try {
      const [res1, res2, res3] = await Promise.all([
        axiosInstance.get("/api/localities"),
        axiosInstance.get("/api/circuites?all=true"),
        axiosInstance.get("/api/establishments?all=true"),
      ]);

      setLocalidades(res1.data.localidades);
      setCircuitos(res2.data.items);
      setEstablecimientos(res3.data.items);
    } catch (err) {
      console.error("Error cargando filtros:", err);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    const parsedValue = value === "__all__" ? undefined : value;
    const updated = {
      ...selectedFilters,
      [key]: parsedValue,
    };
    setSelectedFilters(updated);
    onFiltersChange(updated);
  };

  return (
    <GenericFiltersGridWithCombo
      filters={filtersConfig}
      selected={selectedFilters}
      onFilterChange={handleFilterChange}
    />
  );
}
