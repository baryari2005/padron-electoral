// components/CategoriaRanking.tsx
"use client";

import { TotalVoteSummary } from "@/app/(dashboard)/reports/total-summary/components/types/TotalVoteSummary";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";

interface CategoriaRankingProps {
  categoria: string; // "DIPUTADOS" | "SENADORES"
}

export function CategoriaRanking({ categoria }: CategoriaRankingProps) {
  const [resultados, setResultados] = useState<TotalVoteSummary["resultados"]>([]);

  useEffect(() => {
    axiosInstance.get("/api/reports/total-vote-summary")
      .then((res) => setResultados(res.data.resultados))
      .catch(console.error);
  }, []);

  const datosCategoria = resultados
    .filter(r => r.categoria === categoria)
    .sort((a, b) => b.votos - a.votos)
    .slice(0, 5);

  return (
    <div className="shadow-sm bg-background rounded-lg p-5 py-5 hover:shadow-lg transition">
      <h3 className="font-semibold text-sm text-muted-foreground mb-2">
        Top 5 agrupaciones políticas - {categoria}
      </h3>
      <ul className="text-sm space-y-1">
        {datosCategoria.map((r, idx) => (
          <li key={idx} className="flex justify-between text-xs">
            <span>{idx + 1}. {r.agrupacion}</span>
            <span className="font-medium">{r.votos} votos</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
