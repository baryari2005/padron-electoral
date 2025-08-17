"use client";

import { useMemo } from "react";
import { EstablecimientoResumen } from "../types/types";


const toN = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export type RankItem = { id: number | string; label: string; value: number; percent: number };

export function useRankingsFromSummary(
  escuelas: EstablecimientoResumen[],
  opts?: { top?: number }
) {
  const top = opts?.top ?? 5;

  const { totalVotos, byEstablecimiento, byCircuito } = useMemo(() => {
    let totalVotos = 0;

    // votos por establecimiento (suma de electoresVotaron)
    const byEst: Record<number, number> = {};
    // votos por circuito (usa _circuitoId derivado)
    const byCirc: Record<number, number> = {};

    for (const e of escuelas ?? []) {
      let sumE = 0;
      for (const m of e.mesa ?? []) {
        sumE += toN(m.totalMesa?.electoresVotaron);
      }
      byEst[e.id] = (byEst[e.id] ?? 0) + sumE;
      totalVotos += sumE;

      const circId = (e as any)._circuitoId as number | undefined;
      if (circId != null) {
        byCirc[circId] = (byCirc[circId] ?? 0) + sumE;
      }
    }

    return { totalVotos, byEstablecimiento: byEst, byCircuito: byCirc };
  }, [escuelas]);

  const rankEstablecimientos: RankItem[] = useMemo(() => {
    const items = Object.entries(byEstablecimiento).map(([id, value]) => {
      const esc = escuelas.find((x) => x.id === Number(id));
      const label = esc?.nombre ?? `Establecimiento ${id}`;
      const percent = totalVotos ? (value / totalVotos) * 100 : 0;
      return { id, label, value, percent };
    });
    return items.sort((a, b) => b.value - a.value).slice(0, top);
  }, [byEstablecimiento, escuelas, totalVotos, top]);

  const rankCircuitos: RankItem[] = useMemo(() => {
    const items = Object.entries(byCircuito).map(([id, value]) => {
      const circName = escuelas.find((e) => (e as any)._circuitoId === Number(id))?._circuitoNombre;
      const label = circName ?? `Circuito ${id}`;
      const percent = totalVotos ? (value / totalVotos) * 100 : 0;
      return { id, label, value, percent };
    });
    return items.sort((a, b) => b.value - a.value).slice(0, top);
  }, [byCircuito, escuelas, totalVotos, top]);

  return { totalVotos, rankEstablecimientos, rankCircuitos };
}
