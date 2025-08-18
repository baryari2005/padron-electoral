// src/features/stats/recompute.ts
"use server";

import { db } from "@/lib/db";

/**
 * Recalcula estadísticas de padrón por mesa / establecimiento / circuito.
 * Sin transacción larga (idempotente) para evitar timeouts/tx cerradas.
 */
export type RecomputeStatsResult = {
  mesaStatsRows: number;
  establecimientoStatsRows: number;
  circuitoStatsRows: number;
  padronTotal: number;
  mesasTotales: number;
  durationMs: number;
};

export async function recomputeAllStats(): Promise<RecomputeStatsResult> {
  const t0 = Date.now();

  // 1) Limpiar tablas de stats (DELETE es más compatible que TRUNCATE)
  await db.$executeRawUnsafe(`DELETE FROM "MesaStats"`);
  await db.$executeRawUnsafe(`DELETE FROM "EstablecimientoStats"`);
  await db.$executeRawUnsafe(`DELETE FROM "CircuitoStats"`);

  // 2) MesaStats: padrón por mesa (match por establecimiento + número de mesa)
  await db.$executeRawUnsafe(`
    INSERT INTO "MesaStats" ("mesaId","padronTotal","updatedAt")
    SELECT m."id",
           COUNT(*)::int AS padronTotal,
           NOW()         AS updatedAt
    FROM "PadronElectoral" p
    JOIN "MesasPorEstablecimiento" m
      ON m."establecimientoId" = p."establecimientoId"
     AND p."numeroMesa" IS NOT NULL
     AND m."numero" = p."numeroMesa"
    GROUP BY m."id";
  `);

  // 3) EstablecimientoStats: padrón total + cantidad de mesas por establecimiento
  await db.$executeRawUnsafe(`
    INSERT INTO "EstablecimientoStats" ("establecimientoId","padronTotal","mesasCount","updatedAt")
    SELECT e."id" AS establecimientoId,
           COALESCE(pad."padronTotal", 0)::int AS padronTotal,
           COALESCE(mes."mesasCount",   0)::int AS mesasCount,
           NOW() AS updatedAt
    FROM "Establecimiento" e
    LEFT JOIN (
      SELECT p."establecimientoId", COUNT(*) AS "padronTotal"
      FROM "PadronElectoral" p
      GROUP BY p."establecimientoId"
    ) pad ON pad."establecimientoId" = e."id"
    LEFT JOIN (
      SELECT m."establecimientoId", COUNT(*) AS "mesasCount"
      FROM "MesasPorEstablecimiento" m
      GROUP BY m."establecimientoId"
    ) mes ON mes."establecimientoId" = e."id";
  `);

  // 4) CircuitoStats: padrón total + cantidad de mesas por circuito
  await db.$executeRawUnsafe(`
    INSERT INTO "CircuitoStats" ("circuitoId","padronTotal","mesasCount","updatedAt")
    SELECT c."id" AS circuitoId,
           COALESCE(pad."padronTotal", 0)::int AS padronTotal,
           COALESCE(mes."mesasCount",   0)::int AS mesasCount,
           NOW() AS updatedAt
    FROM "Circuito" c
    LEFT JOIN (
      SELECT p."circuitoId", COUNT(*) AS "padronTotal"
      FROM "PadronElectoral" p
      GROUP BY p."circuitoId"
    ) pad ON pad."circuitoId" = c."id"
    LEFT JOIN (
      SELECT e."circuitoId", COUNT(m."id") AS "mesasCount"
      FROM "Establecimiento" e
      LEFT JOIN "MesasPorEstablecimiento" m ON m."establecimientoId" = e."id"
      GROUP BY e."circuitoId"
    ) mes ON mes."circuitoId" = c."id";
  `);

  // 5) Totales globales
  const [{ count: padronCount }] =
    await db.$queryRawUnsafe<{ count: bigint }[]>(`SELECT COUNT(*) FROM "PadronElectoral"`);
  const [{ count: mesasCount }] =
    await db.$queryRawUnsafe<{ count: bigint }[]>(`SELECT COUNT(*) FROM "MesasPorEstablecimiento"`);

  await db.globalStats.upsert({
    where: { id: 1 },
    create: { id: 1, padronTotal: Number(padronCount), mesasTotales: Number(mesasCount), updatedAt: new Date() },
    update: { padronTotal: Number(padronCount), mesasTotales: Number(mesasCount), updatedAt: new Date() },
  });

  // 6) Métricas resultantes
  const [mesaStatsRows, establecimientoStatsRows, circuitoStatsRows] = await Promise.all([
    db.mesaStats.count(),
    db.establecimientoStats.count(),
    db.circuitoStats.count(),
  ]);

  return {
    mesaStatsRows,
    establecimientoStatsRows,
    circuitoStatsRows,
    padronTotal: Number(padronCount),
    mesasTotales: Number(mesasCount),
    durationMs: Date.now() - t0,
  };
}
