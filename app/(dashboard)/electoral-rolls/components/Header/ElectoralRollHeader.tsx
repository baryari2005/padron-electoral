"use client";

import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { GenericFiltersGridWithCombo } from "@/app/(dashboard)/components";

interface ElectoralRollHeaderProps {
  onFiltersChange: (filters: {
    localidad?: string;
    circuitoId?: number;
    establecimientoId?: number;
    personaOperativaId?: number;
  }) => void;
  electionType?: string;
}

export function ElectoralRollHeader({ onFiltersChange, electionType }: ElectoralRollHeaderProps) {
  const [localidades, setLocalidades] = useState<string[]>([]);
  const [circuitos, setCircuitos] = useState<
    { id: number; nombre: string; codigo: string }[]
  >([]);
  const [establecimientos, setEstablecimientos] = useState<
    { id: number; nombre: string }[]
  >([]);
  const [personasOperativas, setPersonasOperativas] = useState<
    { id: number; nombre: string; tipo: string }[]
  >([]);

  const [selectedFilters, setSelectedFilters] = useState<{
    localidad?: string;
    circuitoId?: number;
    establecimientoId?: number;
    referenteId?: number;
    planilleroId?: number;
    choferId?: number;
  }>({});

  const referentes = personasOperativas.filter(p => p.tipo === "REFERENTE");
  const planilleros = personasOperativas.filter(p => p.tipo === "PLANILLERO");
  const choferes = personasOperativas.filter(p => p.tipo === "CHOFER");

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
    ...(electionType === "INTERNA"
      ? [
        {
          key: "referenteId",
          label: "Referente",
          options: [
            { id: "__all__", nombre: "Todos" },
            ...referentes,
          ],
          getOptionLabel: (opt: any) => opt.nombre,
          getOptionValue: (opt: any) => String(opt.id),
          isNumber: true,
        },
        {
          key: "planilleroId",
          label: "Planillero",
          options: [
            { id: "__all__", nombre: "Todos" },
            ...planilleros,
          ],
          getOptionLabel: (opt: any) => opt.nombre,
          getOptionValue: (opt: any) => String(opt.id),
          isNumber: true,
        },
        {
          key: "choferId",
          label: "Chofer",
          options: [
            { id: "__all__", nombre: "Todos" },
            ...choferes,
          ],
          getOptionLabel: (opt: any) => opt.nombre,
          getOptionValue: (opt: any) => String(opt.id),
          isNumber: true,
        },
      ]
      : []),
  ];


  const fetchFilterOptions = useCallback(async () => {
    try {
      const promises = [
        axiosInstance.get("/api/localities"),
        axiosInstance.get("/api/circuites?all=true"),
        axiosInstance.get("/api/establishments?all=true"),
      ];

      if (electionType === "INTERNA") {
        promises.push(
          axiosInstance.get("/api/operational_person?all=true")
        );
      }

      const responses = await Promise.all(promises);

      setLocalidades(responses[0].data.localidades);
      setCircuitos(responses[1].data.items);
      setEstablecimientos(responses[2].data.items);

      if (electionType === "INTERNA") {
        setPersonasOperativas(responses[3].data.items);
      }
    } catch (err) {
      console.error("Error cargando filtros:", err);
    }
  }, [electionType]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

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
