"use client";

import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/utils/axios";
import { AlertTriangle, Loader2 } from "lucide-react";

import { RankingCategory } from "./RankingCategory";
import { AlertCard } from "../AlertCard/AlertCard";
import { useCategoriesFromSummary } from "./hooks/useCategoriesFromSummary";
import { buildCategoriaOrderMap } from "../common/charts/orders";

type CategoriaDTO = { nombre: string; orden: number | null };

const norm = (s: string) => (s ?? "").trim().toUpperCase();

export function RankingCategoryGridFromTable() {
  // 1) Categorías desde el summary (solo con resultados)
  const { categorias: categoriasRaw = [], loading, error } = useCategoriesFromSummary({
    onlyWithResults: true,
  });

  // 2) Traemos orden desde DB
  const [categoriasDb, setCategoriasDb] = useState<CategoriaDTO[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [errorDb, setErrorDb] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoadingDb(true);
    axiosInstance
      .get("/api/political-position") // => [{ nombre, orden }]
      .then((res) => {
        if (!mounted) return;
        setCategoriasDb(res.data ?? []);
        setErrorDb(null);
      })
      .catch((e) => {
        console.error(e);
        if (mounted) setErrorDb("No se pudo cargar el orden de categorías");
      })
      .finally(() => mounted && setLoadingDb(false));
    return () => { mounted = false; };
  }, []);

  // 3) Mapa de orden basado en DB
  const orderMap = useMemo(
    () =>
      buildCategoriaOrderMap(
        categoriasDb.map((c) => ({ nombre: c.nombre, orden: c.orden ?? undefined }))
      ),
    [categoriasDb]
  );

  // 4) Rank explícito + sort estable (desempate alfabético)
  const ordenadas = useMemo(() => {
    const rank = (name: string) => {
      const i = (orderMap as Record<string, number>)[norm(name)];
      return i === undefined ? Number.POSITIVE_INFINITY : i; // desconocidas al final
    };

    return [...categoriasRaw].sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      if (ra !== rb) return ra - rb;
      return norm(a).localeCompare(norm(b), "es", { sensitivity: "base" });
    });
  }, [categoriasRaw, orderMap]);

  // 5) No rendereamos la grilla hasta tener ambos datasets listos
  if (loading || loadingDb) {
    return (
      <div className="mt-10 flex items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground animate-pulse">
          Cargando Ranking de Agrupaciones Políticas por Cargo...
        </span>
      </div>
    );
  }

  if (error || errorDb) {
    return (
      <div className="mt-6">
        <AlertCard
          variant="destructive"
          title={error ?? errorDb ?? "Ocurrió un error"}
          description="Intentá nuevamente más tarde."
          className="mt-2"
        />
      </div>
    );
  }

  if (!ordenadas.length) {
    return (
      <AlertCard
        variant="default"
        title="Sin datos"
        description="Aún no hay resultados para mostrar."
        className="mt-2"
      />
    ) 
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full mt-6">
      {ordenadas.map((cat) => (
        <RankingCategory key={cat} category={cat} />
      ))}
    </div>
  );
}
