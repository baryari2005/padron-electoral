"use client";

import { useEffect, useMemo, useState } from "react";
import { EstablecimientoResumen } from "../types/types";


const toN = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export function useDashboardStats(opts: {
  escuelas: EstablecimientoResumen[];
  /** total de mesas habilitadas (para % escrutado). Si no lo pasás, usa la cantidad visible. */
  totalMesasHabilitadas?: number | null;
  /** padrón total (para % participación). Si no lo pasás, oculta ese badge. */
  padronTotal?: number | null;
  /** clave para comparar contra el cálculo anterior (para delta). */
  storageKey?: string;
}) {
  const { escuelas, totalMesasHabilitadas, padronTotal, storageKey = "sc:dashboard-stats" } = opts;

  const mesas = useMemo(() => escuelas.flatMap((e) => e.mesa ?? []), [escuelas]);

  // Considero "escrutada" si hay totales y al menos un dato > 0
  const mesasEscrutadas = useMemo(
    () =>
      mesas.filter((m) => {
        const t = m.totalMesa;
        if (!t) return false;
        return toN(t.sobresEnUrna) > 0 || toN(t.electoresVotaron) > 0;
      }).length,
    [mesas]
  );

  const habilitadas = useMemo(
    () => (totalMesasHabilitadas ?? mesas.length),
    [totalMesasHabilitadas, mesas.length]
  );

  const porcentajeEscrutado = habilitadas ? (mesasEscrutadas / habilitadas) * 100 : 0;

  const votantesRegistrados = useMemo(
    () => mesas.reduce((acc, m) => acc + toN(m.totalMesa?.electoresVotaron), 0),
    [mesas]
  );

  const porcentajeParticipacion = padronTotal ? (votantesRegistrados / padronTotal) * 100 : null;

  // Delta (vs. último cálculo) para la pill pequeña
  const [deltaEscrutado, setDeltaEscrutado] = useState<number | null>(null);
  useEffect(() => {
    try {
      const prev = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (prev && typeof prev.porcentajeEscrutado === "number") {
        setDeltaEscrutado(porcentajeEscrutado - prev.porcentajeEscrutado);
      }
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          porcentajeEscrutado,
          mesasEscrutadas,
          votantesRegistrados,
          ts: Date.now(),
        })
      );
    } catch {}
  }, [porcentajeEscrutado, mesasEscrutadas, votantesRegistrados, storageKey]);

  return {
    mesasEscrutadas,
    habilitadas,
    porcentajeEscrutado,
    votantesRegistrados,
    porcentajeParticipacion,
    deltaEscrutado,
  };
}
