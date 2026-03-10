// src/lib/server/dashboard/progreso.ts

import { db } from "@/lib/db";
import { pct } from "./utils";

export async function getProgress(eleccionId: number) {
  const [estStats, circStats] = await Promise.all([
    db.establecimientoStats.findMany({
      where: { eleccionId },
    }),
    db.circuitoStats.findMany({
      where: { eleccionId },
    }),
  ]);

  const [escrEst, escrCir] = await Promise.all([
    db.mesaEscrutada.groupBy({
      by: ["establecimientoId"],
      where: { deletedAt: null, eleccionId },
      _count: { _all: true },
    }),
    db.mesaEscrutada.groupBy({
      by: ["circuitoId"],
      where: { deletedAt: null, eleccionId },
      _count: { _all: true },
    }),
  ]);

  const estEsMap = new Map(
    escrEst.map((x) => [x.establecimientoId, x._count._all])
  );
  const cirEsMap = new Map(
    escrCir.map((x) => [x.circuitoId, x._count._all])
  );

  const progresoPorEscuela = estStats.map((s) => {
    const escr = estEsMap.get(s.establecimientoId) ?? 0;
    return {
      establecimientoId: s.establecimientoId,
      mesasEscrutadas: escr,
      mesasTotales: s.mesasCount,
      porcentaje: pct(escr, s.mesasCount),
      faltan: Math.max(s.mesasCount - escr, 0),
    };
  });

  const progresoPorCircuito = circStats.map((s) => {
    const escr = cirEsMap.get(s.circuitoId) ?? 0;
    return {
      circuitoId: s.circuitoId,
      mesasEscrutadas: escr,
      mesasTotales: s.mesasCount,
      porcentaje: pct(escr, s.mesasCount),
      faltan: Math.max(s.mesasCount - escr, 0),
    };
  });

  return {
    porEscuela: progresoPorEscuela,
    porCircuito: progresoPorCircuito,
  };
}