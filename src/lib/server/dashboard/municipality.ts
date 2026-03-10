// src/lib/server/dashboard/municipio.ts

import { db } from "@/lib/db";
import { pct } from "./utils";

export async function getMunicipalityStats(eleccionId: number) {
  const global = await db.globalStats.findUnique({
    where: { eleccionId },
  });

  const mesasEscrutadas = await db.mesaEscrutada.count({
    where: { deletedAt: null, eleccionId },
  });

  const agg = await db.resultadoPorMesa.aggregate({
    where: { eleccionId },
    _sum: { electoresVotaron: true, sobresEnUrna: true },
  });

  const votantes =
    (agg._sum.electoresVotaron ?? 0) || (agg._sum.sobresEnUrna ?? 0);

  const padronTotal = global?.padronTotal ?? 0;
  const mesasTotales = global?.mesasTotales ?? 0;

  return {
    padronTotal,
    mesasTotales,
    mesasEscrutadas,
    porcentajeEscrutado: pct(mesasEscrutadas, mesasTotales),
    votantesRegistrados: votantes,
    participacionMunicipal: pct(votantes, padronTotal),
    faltanMesas: Math.max(mesasTotales - mesasEscrutadas, 0),
  };
}