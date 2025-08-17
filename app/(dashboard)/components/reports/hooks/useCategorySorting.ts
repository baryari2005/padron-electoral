"use client";
import { useMemo } from "react";
import { getCategoriasUnicas } from "../utils/chartUtils";
import { Resultado } from "../types/types";


export function useCategorySorting(resultados: Resultado[], categoryOrder: string[]) {
  const orderMap = useMemo(() => {
    const m = new Map<string, number>();
    categoryOrder.forEach((n, i) => m.set(n.toUpperCase(), i));
    return m;
  }, [categoryOrder]);

  const sortCategorias = (a: string, b: string) =>
    (orderMap.get(a.toUpperCase()) ?? 1e9) - (orderMap.get(b.toUpperCase()) ?? 1e9);

  const categoriasOrdenadas = useMemo(
    () => getCategoriasUnicas(resultados).sort(sortCategorias),
    [resultados, orderMap]
  );

  return { orderMap, sortCategorias, categoriasOrdenadas };
}
