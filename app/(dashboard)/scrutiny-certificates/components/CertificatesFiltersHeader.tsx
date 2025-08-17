"use client";

import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/utils/axios";
import { GenericFiltersGridWithCombo } from "@/app/(dashboard)/components";

export type CertificatesFilters = {
  circuitoId?: number;
  establecimientoId?: number;
};

type Circuito = { id: number; nombre: string; codigo: string };
type Establecimiento = { id: number; nombre: string; circuitoId?: number };

type Props = {
  onFiltersChange: (filters: CertificatesFilters) => void;
};

export function CertificatesFiltersHeader({ onFiltersChange }: Props) {
  const [circuitos, setCircuitos] = useState<Circuito[]>([]);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [selected, setSelected] = useState<CertificatesFilters>({});

  useEffect(() => {
    (async () => {
      try {
        const [resCir, resEst] = await Promise.all([
          axiosInstance.get("/api/circuites?all=true"),
          axiosInstance.get("/api/establishments?all=true"),
        ]);
        setCircuitos(resCir.data?.items ?? []);
        setEstablecimientos(resEst.data?.items ?? []);
      } catch (e) {
        console.error("Error cargando filtros:", e);
      }
    })();
  }, []);

  // Establecimientos dependientes del circuito seleccionado
  const establecimientosOpts = useMemo(() => {
    if (!selected.circuitoId) return establecimientos;
    return establecimientos.filter(e => e.circuitoId === selected.circuitoId);
  }, [establecimientos, selected.circuitoId]);

  const handleFilterChange = (key: keyof CertificatesFilters, value: string | number | undefined) => {
    const parsed = value === "__all__" ? undefined : value;
    const next = { ...selected, [key]: parsed } as CertificatesFilters;

    // si cambia el circuito, limpiamos establecimiento si no corresponde
    if (key === "circuitoId") {
      const ok =
        !next.establecimientoId ||
        establecimientos.some(e => e.id === next.establecimientoId && e.circuitoId === parsed);
      if (!ok) next.establecimientoId = undefined;
    }

    setSelected(next);
    onFiltersChange(next);
  };

  const filtersConfig = [
    {
      key: "circuitoId",
      label: "Circuito",
      options: [{ id: "__all__", nombre: "Todos", codigo: "" }, ...circuitos],
      getOptionLabel: (opt: any) => (opt.codigo ? `${opt.codigo} — ${opt.nombre}` : opt.nombre),
      getOptionValue: (opt: any) => String(opt.id),
      isNumber: true,
    },
    {
      key: "establecimientoId",
      label: "Establecimiento",
      options: [{ id: "__all__", nombre: "Todos" }, ...establecimientosOpts],
      getOptionLabel: (opt: any) => opt.nombre,
      getOptionValue: (opt: any) => String(opt.id),
      isNumber: true,
    },
  ];

  return (
    <GenericFiltersGridWithCombo
      filters={filtersConfig}
      selected={selected}
      onFilterChange={(k, v) => handleFilterChange(k as keyof CertificatesFilters, v)}
    />
  );
}
