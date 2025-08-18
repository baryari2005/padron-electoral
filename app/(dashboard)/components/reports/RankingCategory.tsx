"use client";

import { Loader2 } from "lucide-react";
import { useRankingCategory } from "./hooks/useRankingCategory";
import { RankingCategoryProps } from "./types/rankingcategoy.types";

export function RankingCategory({ category, topN = 5 }: RankingCategoryProps) {
  const { ranking, loading, error } = useRankingCategory(category, topN);


  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground animate-pulse">
          Top {topN} agrupaciones políticas — {category}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shadow-sm bg-background rounded-lg p-5 py-5">
        <h3 className="font-semibold text-sm text-muted-foreground mb-2">
          Top {topN} agrupaciones políticas — {category}
        </h3>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="shadow-sm bg-background rounded-lg p-5 py-5 hover:shadow-lg transition">
      <h3 className="font-semibold text-sm text-muted-foreground mb-2">
        Top {topN} agrupaciones políticas — {category}
      </h3>

      {ranking.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Sin resultados para {category}.
        </p>
      ) : (
        <ul className="text-sm space-y-1">
          {ranking.map((r, idx) => (
            <li key={`${r.agrupacion}-${idx}`} className="flex justify-between text-xs">
              <span>{idx + 1}. {r.agrupacion}</span>
              <span className="font-medium">
                {Intl.NumberFormat("es-AR").format(r.votos)} votos
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
