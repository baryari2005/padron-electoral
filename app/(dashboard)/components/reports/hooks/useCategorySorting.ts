"use client";
import { useMemo, useCallback } from "react";
import { getCategoriasUnicas } from "../utils/chartUtils";
import { Resultado } from "../types/types";

export function useCategorySorting(resultados: Resultado[], categoryOrder: string[]) {
  const orderMap = useMemo(() => {
    const m = new Map<string, number>();
    categoryOrder.forEach((n, i) => m.set(n.toUpperCase(), i));
    return m;
  }, [categoryOrder]);

  const sortCategorias = useCallback(
    (a: string, b: string) => {
      const ai = orderMap.get(a.toUpperCase()) ?? 1e9;
      const bi = orderMap.get(b.toUpperCase()) ?? 1e9;
      return ai - bi;
    },
    [orderMap]
  );

  const categoriasOrdenadas = useMemo(() => {
    const únicas = getCategoriasUnicas(resultados);
    // .sort muta: si preferís inmutabilidad, copiá antes: [...únicas].sort(...)
    únicas.sort(sortCategorias);
    return únicas;
  }, [resultados, sortCategorias]);

  return { orderMap, sortCategorias, categoriasOrdenadas };
}
