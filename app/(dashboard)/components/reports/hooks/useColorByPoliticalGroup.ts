// components/reports/VotesAccordionItem/hooks/useColorByPoliticalGroup.ts
"use client";
import { useMemo } from "react";
import type { Resultado } from "../types/types";

const norm = (s?: string) => (s ?? "").trim().toUpperCase();

export function useColorByPoliticalGroup(resultados: Resultado[]) {
  return useMemo(() => {
    const m = new Map<string, string>();
    for (const r of resultados) {
      const key = norm(r.agrupacion);
      const hex = r.color ?? r.color ?? "#000000"; // ya te llega como `color`
      if (key && hex && !m.has(key)) m.set(key, hex);
    }
    return m; // 👈 devolvemos directamente el Map<string,string>
  }, [resultados]);
}
