"use client";

import { useMemo } from "react";
import { useTotalVoteSummary, type Resultado } from "./useTotalVoteSummary";

export function useRankingCategory(category: string, topN = 5) {
  const { data, loading, error, reload } = useTotalVoteSummary();

  const catNorm = (category ?? "").trim().toUpperCase();

  const ranking: Resultado[] = useMemo(() => {
    const arr = (data ?? [])
      .filter(r => (r.categoria ?? "").trim().toUpperCase() === catNorm)
      .sort((a, b) => b.votos - a.votos)
      .slice(0, topN);

    if (process.env.NODE_ENV !== "production") {
      // logs útiles para validar el filtro
      console.log(`[useCategoriaRanking] ${catNorm} top${topN}:`, arr);
    }
    return arr;
  }, [data, catNorm, topN]);

  return { ranking, loading, error, reload };
}
