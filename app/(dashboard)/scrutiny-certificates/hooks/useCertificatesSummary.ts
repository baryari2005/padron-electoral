// src/features/scrutiny-certificates/hooks/useCertificatesSummary.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "@/utils/axios";
import { toast } from "sonner";
import { formatApiMessage } from "@/lib/utils/formatters";
import { CertificatesFilters, CircuitoCat, EstablecimientoCat, EstablecimientoResumen } from "../types/types";

// Tipamos las respuestas de API
type SummaryRes = { items: EstablecimientoResumen[] };
type ListRes<T> = { items: T[] };

export function useCertificatesSummary() {
  const [filters, setFilters] = useState<CertificatesFilters>({});
  const [escuelas, setEscuelas] = useState<EstablecimientoResumen[]>([]);
  const [establecimientos, setEstablecimientos] = useState<EstablecimientoCat[]>([]);
  const [circuitos, setCircuitos] = useState<CircuitoCat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get<SummaryRes>("/api/scrutiny-certificates/summary"),
      axios.get<ListRes<EstablecimientoCat>>("/api/establishments?all=true"),
      axios.get<ListRes<CircuitoCat>>("/api/circuites?all=true"),
    ])
      .then(([sum, est, cir]) => {
        setEscuelas(sum.data?.items ?? []);
        setEstablecimientos(est.data?.items ?? []);
        setCircuitos(cir.data?.items ?? []);
      })
      .catch(() => toast.error(formatApiMessage("errors.certificateBadRequest")))
      .finally(() => setLoading(false));
  }, []);

  // Índices para lookups rápidos
  const estIndex = useMemo(
    () => new Map<number, EstablecimientoCat>(establecimientos.map((e) => [e.id, e])),
    [establecimientos]
  );
  const circIndex = useMemo(
    () => new Map<number, CircuitoCat>(circuitos.map((c) => [c.id, c])),
    [circuitos]
  );

  // Enriquecemos con _circuitoId / _circuitoNombre (si faltan en el summary)
  const escuelasEnriquecidas = useMemo<EstablecimientoResumen[]>(() => {
    return (escuelas ?? []).map((e) => {
      const est = estIndex.get(e.id);
      const _circuitoId = e.circuitoId ?? est?.circuitoId ?? e.circuito?.id ?? undefined;
      const _circuitoNombre =
        e.circuito?.nombre ?? (_circuitoId ? circIndex.get(_circuitoId)?.nombre : undefined);
      return { ...e, _circuitoId, _circuitoNombre };
    });
  }, [escuelas, estIndex, circIndex]);

  // Filtro por circuito y establecimiento
  const escuelasFiltradas = useMemo<EstablecimientoResumen[]>(() => {
    const { circuitoId, establecimientoId } = filters;
    return (escuelasEnriquecidas ?? []).filter((e) => {
      if (establecimientoId && e.id !== establecimientoId) return false;
      if (circuitoId && e._circuitoId !== circuitoId) return false;
      return true;
    });
  }, [escuelasEnriquecidas, filters]);

  const totalMesas = useMemo(
    () => escuelasFiltradas.reduce((acc, e) => acc + e.mesa.length, 0),
    [escuelasFiltradas]
  );

  return { filters, setFilters, escuelas: escuelasEnriquecidas, escuelasFiltradas, totalMesas, loading };
}
