// src/lib/server/dashboard/participacion.ts

import { db } from "@/lib/db";
import { pct } from "./utils";

export async function getStake(eleccionId: number) {
  const estStats = await db.establecimientoStats.findMany({
    where: { eleccionId },
  });

  const votantes = await db.resultadoPorMesa.findMany({
    where: { eleccionId },
    select: { mesaId: true, electoresVotaron: true, sobresEnUrna: true },
  });

  const totalVotantes = votantes.reduce(
    (acc, r) => acc + (r.electoresVotaron ?? r.sobresEnUrna ?? 0),
    0
  );

  const participacionEscuelas = estStats.map((s) => ({
    establecimientoId: s.establecimientoId,
    padron: s.padronTotal,
    votantes: totalVotantes,
    participacion: pct(totalVotantes, s.padronTotal),
  }));

  return {
    porEscuela: participacionEscuelas,
  };
}