// src/lib/server/dashboard/index.ts

import "server-only";
import { getMunicipalityStats,  } from "./municipality";
import { getTopVotes } from "./top";
import { getProgress } from "./progress";
import { getStake } from "./stake";
import { getSpecialVotes } from "./specialVotes";
import { getResultsByCategory } from "./categories";


export async function getDashboardSummary(eleccionId: number) {
  const [
    municipio,
    top,
    progreso,
    participacion,
    especiales,
    categorias,
  ] = await Promise.all([
    getMunicipalityStats(eleccionId),
    getTopVotes(eleccionId),
    getProgress(eleccionId),
    getStake(eleccionId),
    getSpecialVotes(eleccionId),
    getResultsByCategory(eleccionId),
  ]);

  return {
    ok: true,
    municipio,
    top,
    progreso,
    participacion,
    especiales,
    categorias,
  };
}