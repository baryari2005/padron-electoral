"use client";

import { useMemo } from "react";
import { useTotalVoteSummary } from "./useTotalVoteSummary";
import type { Resultado } from "../../common/types/votes.types";

type Options = {
  /** Si es true, devuelve solo categorías con > 0 votos */
  onlyWithResults?: boolean;
};

/** Devuelve la lista de categorías únicas presentes en el summary */
export function useCategoriesFromSummary(opts: Options = {}) {
  const { onlyWithResults = false } = opts;

  // Aseguramos default [] para evitar undefined
  const { data = [], loading, error, reload } = useTotalVoteSummary();

  const categorias = useMemo(() => {
    // totalizamos votos por categoría
    const totales = new Map<string, number>();

    for (const r of (data as Resultado[])) {
      const cat = (r.categoria ?? "").trim();
      if (!cat) continue;
      const votos = Number(r.votos ?? 0);
      totales.set(cat, (totales.get(cat) ?? 0) + votos);
    }

    const todas = Array.from(totales.keys());
    if (!onlyWithResults) return todas;

    // filtra solo las que tengan > 0 votos acumulados
    return todas.filter((cat) => (totales.get(cat) ?? 0) > 0);
  }, [data, onlyWithResults]);

  return { categorias, loading, error, reload };
}
