// src/lib/server/dashboard/categorias.ts

import { db } from "@/lib/db";

export async function getResultsByCategory(eleccionId: number) {
  const agg = await db.resultadoPorAgrupacionPolitica.groupBy({
    by: ["categoriaId", "agrupacionId"],
    where: { eleccionId },
    _sum: { votos: true },
  });

  return agg;
}