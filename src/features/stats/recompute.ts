"use server";

import { db } from "@/lib/db";

export type RecomputeStatsResult = {
  mesaStatsRows: number;
  establecimientoStatsRows: number;
  circuitoStatsRows: number;
  padronTotal: number;
  mesasTotales: number;
  durationMs: number;
};

export async function recomputeAllStats(
  eleccionId: number
): Promise<RecomputeStatsResult> {
  const t0 = Date.now();

  // 1️⃣ Limpiar SOLO stats de esa elección
  await db.mesaStats.deleteMany({ where: { eleccionId } });
  await db.establecimientoStats.deleteMany({ where: { eleccionId } });
  await db.circuitoStats.deleteMany({ where: { eleccionId } });

  // 2️⃣ MesaStats
  await db.$executeRawUnsafe(`
    INSERT INTO "MesaStats" ("mesaId","padronTotal","updatedAt","eleccionId")
    SELECT m."id",
           COUNT(*)::int AS padronTotal,
           NOW(),
           ${eleccionId}
    FROM "PadronElectoral" p
    JOIN "MesasPorEstablecimiento" m
      ON m."establecimientoId" = p."establecimientoId"
     AND m."eleccionId" = ${eleccionId}
     AND p."eleccionId" = ${eleccionId}
     AND p."numeroMesa" IS NOT NULL
     AND m."numero" = p."numeroMesa"
    GROUP BY m."id";
  `);

  // 3️⃣ EstablecimientoStats
  await db.$executeRawUnsafe(`
    INSERT INTO "EstablecimientoStats"
    ("establecimientoId","padronTotal","mesasCount","updatedAt","eleccionId")
    SELECT e."id",
           COALESCE(pad."padronTotal", 0)::int,
           COALESCE(mes."mesasCount",   0)::int,
           NOW(),
           ${eleccionId}
    FROM "Establecimiento" e
    LEFT JOIN (
      SELECT p."establecimientoId", COUNT(*) AS "padronTotal"
      FROM "PadronElectoral" p
      WHERE p."eleccionId" = ${eleccionId}
      GROUP BY p."establecimientoId"
    ) pad ON pad."establecimientoId" = e."id"
    LEFT JOIN (
      SELECT m."establecimientoId", COUNT(*) AS "mesasCount"
      FROM "MesasPorEstablecimiento" m
      WHERE m."eleccionId" = ${eleccionId}
      GROUP BY m."establecimientoId"
    ) mes ON mes."establecimientoId" = e."id"
    WHERE e."eleccionId" = ${eleccionId};
  `);

  // 4️⃣ CircuitoStats
  await db.$executeRawUnsafe(`
    INSERT INTO "CircuitoStats"
    ("circuitoId","padronTotal","mesasCount","updatedAt","eleccionId")
    SELECT c."id",
           COALESCE(pad."padronTotal", 0)::int,
           COALESCE(mes."mesasCount",   0)::int,
           NOW(),
           ${eleccionId}
    FROM "Circuito" c
    LEFT JOIN (
      SELECT p."circuitoId", COUNT(*) AS "padronTotal"
      FROM "PadronElectoral" p
      WHERE p."eleccionId" = ${eleccionId}
      GROUP BY p."circuitoId"
    ) pad ON pad."circuitoId" = c."id"
    LEFT JOIN (
      SELECT e."circuitoId", COUNT(m."id") AS "mesasCount"
      FROM "Establecimiento" e
      LEFT JOIN "MesasPorEstablecimiento" m
        ON m."establecimientoId" = e."id"
       AND m."eleccionId" = ${eleccionId}
      WHERE e."eleccionId" = ${eleccionId}
      GROUP BY e."circuitoId"
    ) mes ON mes."circuitoId" = c."id"
    WHERE c."eleccionId" = ${eleccionId};
  `);

  // 5️⃣ Totales globales por elección
  const [{ count: padronCount }] =
    await db.$queryRawUnsafe<{ count: bigint }[]>(`
      SELECT COUNT(*)
      FROM "PadronElectoral"
      WHERE "eleccionId" = ${eleccionId}
    `);

  const [{ count: mesasCount }] =
    await db.$queryRawUnsafe<{ count: bigint }[]>(`
      SELECT COUNT(*)
      FROM "MesasPorEstablecimiento"
      WHERE "eleccionId" = ${eleccionId}
    `);

  await db.globalStats.upsert({
    where: { eleccionId }, // ⚠️ importante
    create: {
      padronTotal: Number(padronCount),
      mesasTotales: Number(mesasCount),
      eleccionId,
      updatedAt: new Date(),
    },
    update: {
      padronTotal: Number(padronCount),
      mesasTotales: Number(mesasCount),
      updatedAt: new Date(),
    },
  });

  // 6️⃣ Métricas finales
  const [mesaStatsRows, establecimientoStatsRows, circuitoStatsRows] =
    await Promise.all([
      db.mesaStats.count({ where: { eleccionId } }),
      db.establecimientoStats.count({ where: { eleccionId } }),
      db.circuitoStats.count({ where: { eleccionId } }),
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