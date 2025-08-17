"use client";
import { useMemo } from "react";
import { Resultado } from "../types/types";

const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function useColorByAgrupacion(resultados: Resultado[], palette = DEFAULT_COLORS) {
  const agrupacionesOrdenadas = useMemo(() => {
    const set = new Set<string>();
    resultados.forEach(r => r.agrupacion && set.add(r.agrupacion));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [resultados]);

  const colorByAgrupacion = useMemo(() => {
    const map = new Map<string, string>();
    agrupacionesOrdenadas.forEach((name, i) => map.set(name, palette[i % palette.length]));
    return map;
  }, [agrupacionesOrdenadas, palette]);

  return { colorByAgrupacion, agrupacionesOrdenadas };
}
