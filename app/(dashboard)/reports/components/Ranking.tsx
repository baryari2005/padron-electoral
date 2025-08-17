"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { buildRankingByCategoria } from "../../components/reports/utils/chartUtils";
import { AvatarLogo } from "@/app/(dashboard)/components/common/AvatarLogo";
import { VoteSummary } from "./types/MesaVoteSummary.type";

interface RankingProps {
  resultados: VoteSummary["resultados"];
  /** Orden de categorías proveniente de DB (CargoPolitico.orden) */
  categoryOrder?: string[];
}

export function Ranking({ resultados, categoryOrder }: RankingProps) {
  // 1) Construir ranking agrupado y ORDENADO por votos (derivado puro de resultados)
  const ranking = useMemo(() => {
    const agrupado = buildRankingByCategoria(resultados) as Record<
      string,
      { agrupacion: string; votos: number; logo?: string | null }[]
    >;

    const out: typeof agrupado = {};
    for (const [categoria, valores] of Object.entries(agrupado)) {
      // ordenar desc por votos
      out[categoria] = [...valores].sort((a, b) => b.votos - a.votos);
    }
    return out;
  }, [resultados]);

  // 2) Mapa de orden segun DB (estable)
  const orderMap = useMemo(() => {
    const order = categoryOrder?.map((c) => c.toUpperCase()) ?? [];
    const map = new Map<string, number>();
    order.forEach((name, i) => map.set(name, i));
    return map;
  }, [categoryOrder]);

  // 3) Claves/categorías a mostrar (respetando orden de DB si existe)
  const categoriaKeys = useMemo(() => {
    const keys = Object.keys(ranking);
    if (!categoryOrder?.length) return keys;
    // mantener solo categorías existentes, en el orden indicado
    const upperSet = new Set(keys.map((k) => k.toUpperCase()));
    return categoryOrder.filter((c) => upperSet.has(c.toUpperCase()));
  }, [ranking, categoryOrder]);

  // Firma estable para detectar cambios reales de categorías (evita loops)
  const keysSig = useMemo(() => categoriaKeys.join("|"), [categoriaKeys]);

  // 4) Visibilidad de categorías (se inicializa/actualiza SOLO cuando cambian las categorías)
  const [visibleCategorias, setVisibleCategorias] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setVisibleCategorias((prev) => {
      // si las mismas claves ya están, no cambies el estado (evita re-render inútil)
      const prevKeys = Object.keys(prev);
      const sameLen = prevKeys.length === categoriaKeys.length;
      const sameSet =
        sameLen &&
        prevKeys.every((k) => categoriaKeys.includes(k)) &&
        categoriaKeys.every((k) => prevKeys.includes(k));

      if (sameSet) return prev;

      // construir nuevo estado: mantengo valores previos si existen, nuevas en true
      const next: Record<string, boolean> = {};
      for (const k of categoriaKeys) {
        next[k] = prev[k] ?? true;
      }
      return next;
    });
    // dependemos de la firma estable, no del objeto ranking
  }, [keysSig]);

  const toggleCategoria = (categoria: string) => {
    setVisibleCategorias((prev) => ({ ...prev, [categoria]: !prev[categoria] }));
  };

  // 5) Orden final de bloques por orderMap (desconocidos quedan al final)
  const sortedEntries = useMemo(() => {
    const BIG = 1e9;
    // uso categoriaKeys para respetar categoryOrder si vino de DB
    const keys = categoriaKeys.length ? categoriaKeys : Object.keys(ranking);
    return keys
      .map((k) => [k, ranking[k] ?? []] as const)
      .sort(([a], [b]) => {
        const ai = orderMap.get(a.toUpperCase()) ?? BIG;
        const bi = orderMap.get(b.toUpperCase()) ?? BIG;
        return ai - bi;
      });
  }, [ranking, categoriaKeys, orderMap]);

  return (
    <div className="space-y-4">
      {sortedEntries.map(([categoria, agrupaciones]) => (
        <div key={categoria}>
          {/* Encabezado con toggle */}
          <div
            className="flex items-center gap-2 cursor-pointer font-semibold text-xs mb-4"
            onClick={() => toggleCategoria(categoria)}
          >
            <span>{categoria}</span>
            {visibleCategorias[categoria] ? (
              <EyeOff className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
          </div>

          {/* Cuerpo */}
          {visibleCategorias[categoria] && (
            <div className="space-y-1 text-xs">
              {agrupaciones.map((a, i) => (
                <div
                  key={`${categoria}-${a.agrupacion}`}
                  className="flex justify-between items-start sm:items-center text-xs flex-col sm:flex-row"
                >
                  {/* Izquierda */}
                  <div className="flex items-center gap-2 min-w-0 sm:w-3/4 w-full">
                    <span className="w-4 text-right shrink-0">{i + 1}.</span>
                    {a.logo && (
                      <AvatarLogo src={a.logo} alt={a.agrupacion} size={24} />
                    )}
                    <span
                      title={a.agrupacion}
                      className="truncate text-left overflow-hidden text-ellipsis"
                    >
                      {a.agrupacion}
                    </span>
                  </div>
                  {/* Derecha */}
                  <div className="sm:w-1/4 w-full text-right text-muted-foreground whitespace-nowrap">
                    {a.votos} votos
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
