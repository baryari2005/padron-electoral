"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import axiosInstance from "@/utils/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomActiveShapePieChart } from "./CustomActiveShapePieChart";
import { AgrupacionConTotales, Resultado } from "../common/types/votes.types";
import { byCategoriaOrderFactory, buildCategoriaOrderMap } from "../common/charts/orders";
import { AlertCard } from "../AlertCard/AlertCard";

type CategoriaDTO = { nombre: string; orden: number | null };

function agrupacionLider(data: AgrupacionConTotales[]) {
  if (!data?.length) return null;
  return data.reduce((max, curr) => (curr.totalVotos > max.totalVotos ? curr : max), data[0]);
}

export default function SummaryPieChartByCategory() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [categoriasDb, setCategoriasDb] = useState<CategoriaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resResultados, resCargos] = await Promise.all([
        axiosInstance.get("/api/reports/total-vote-summary"),
        axiosInstance.get("/api/political-position"), // [{ nombre, orden|null }]
      ]);
      setResultados(resResultados.data?.resultados ?? []);
      setCategoriasDb(resCargos.data ?? []);
    } catch (err) {
      console.error("[SummaryPieChartByCategory] error:", err);
      setError("No se pudo cargar el resumen de votos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await load();
    })();
    return () => { alive = false; };
  }, [load]);

  // Agrupa resultados por categoría -> { [categoria]: AgrupacionConTotales[] }
  const datosPorCategoria = useMemo<Record<string, AgrupacionConTotales[]>>(() => {
    const agrupado: Record<string, Map<string, AgrupacionConTotales>> = {};
    for (const r of resultados ?? []) {
      const categoria = (r.categoria ?? "").trim();
      const agrupacion = (r.agrupacion ?? "").trim();
      if (!categoria || !agrupacion) continue;

      if (!agrupado[categoria]) agrupado[categoria] = new Map();
      const mapa = agrupado[categoria];

      if (!mapa.has(agrupacion)) {
        mapa.set(agrupacion, { nombre: agrupacion, totalVotos: r.votos ?? 0, logo: r.logo ?? null });
      } else {
        const actual = mapa.get(agrupacion)!;
        actual.totalVotos += r.votos ?? 0;
      }
    }
    const salida: Record<string, AgrupacionConTotales[]> = {};
    for (const [categoria, mapa] of Object.entries(agrupado)) {
      salida[categoria] = Array.from(mapa.values());
    }
    return salida;
  }, [resultados]);

  // Orden por DB (ASC). Si no hay orden, cae al alfabético dentro de byCategoriaOrderFactory
  const categoriaOrderMap = useMemo(
    () => buildCategoriaOrderMap(categoriasDb.map((c) => ({ nombre: c.nombre, orden: c.orden ?? undefined }))),
    [categoriasDb]
  );
  const compareCategorias = useMemo(() => byCategoriaOrderFactory(categoriaOrderMap), [categoriaOrderMap]);

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground animate-pulse">
          Cargando gráficos...
        </span>
      </div>
    );
  }
  
  if (error) {
    return (
      <AlertCard
        variant="destructive"
        title="No se pudo cargar el resumen de votos"
        description="Intentá nuevamente más tarde."
        // action={
        //   <Button variant="outline" size="sm" onClick={load}>
        //     Reintentar
        //   </Button>
        // }
        className="mt-2"
      />
    );
  }

  // Estado vacío sin error
  const noHayDatos = Object.keys(datosPorCategoria).length === 0;
  if (noHayDatos) {
    return (
      <AlertCard
        title="Sin datos"
        description="Aún no hay resultados para mostrar."
        className="mt-2"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
      {Object.entries(datosPorCategoria)
        .sort(([a], [b]) => compareCategorias(a, b))
        .map(([categoria, data]) => {
          const lider = agrupacionLider(data);
          return (
            <Card
              key={categoria}
              className="shadow-sm bg-background rounded-lg p-5 py-0 hover:shadow-lg transition"
            >
              <CardHeader>
                <CardTitle className="text-center uppercase text-muted-foreground text-base">
                  {categoria}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2 text-muted-foreground font-semibold text-green-400 text-xs">
                  <Trophy className="w-4 h-4" />
                  {lider ? (
                    <>
                      <span className="text-xs text-foreground text-green-600">{lider.nombre}</span>
                      <span className="text-green-600">— {lider.totalVotos} VOTOS</span>
                    </>
                  ) : (
                    <span>Sin datos</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center w-full">
                <div className="w-full max-w-[360px]">
                  <CustomActiveShapePieChart data={data} />
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
