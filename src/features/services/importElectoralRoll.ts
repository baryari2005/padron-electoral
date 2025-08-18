// src/features/services/importElectoralRoll.ts
"use server";

import { db } from "@/lib/db";
import { parseXlsxToRows } from "../parsers/parseXlsx";
import { norm, toInt } from "../utils/strings";
import type { ImportErrorDetail, ImportOptions, ImportResult } from "../electoral-rolls/types";
import { BATCH_SIZE } from "../electoral-rolls/constants";
import { getField } from "../utils/rowGet";
import { buildCircuitosFromRows, persistCircuitos } from "@/src/lib/circuitos";
import { buildEstablecimientosFromRows, persistEstablecimientos } from "@/src/lib/establecimientos";
import { buildMesasFromRows, persistMesas } from "@/src/lib/mesas";
import { toUpperEs } from "../utils/toUpperEs";
import { persistPadronFromRowsBatched } from "@/src/lib/padron";

// Utilidad para truncar con fallback a deleteMany si no existe/permiso
async function safeTruncateOrDelete(tx: any, debug = true) {
  // NOMBRES EXACTOS de tabla (Modelo Prisma en PascalCase por defecto)
  const statsAndMasters = [
    "MesaStats",
    "EstablecimientoStats",
    "CircuitoStats",
    "GlobalStats",
    "PadronElectoral",
    "MesasPorEstablecimiento",
    "Establecimiento",
    "Circuito",
  ];

  try {
    // Un solo TRUNCATE con CASCADE e IDENTITY reset
    await tx.$executeRawUnsafe(`
      TRUNCATE TABLE        
        "ResultadoVotosEspeciales", "ResultadoPorAgrupacionPolitica", "ResultadoPorMesa", "DiferenciasPorCargosPoliticos",
        "PadronElectoral","MesasPorEstablecimiento","Establecimiento","Circuito"
      RESTART IDENTITY CASCADE
    `);
    if (debug) console.log("[TRUNCATE CASCADE maestro + stats]");
  } catch (e: any) {
    // Fallback ordenado hijo→padre (más lento pero seguro)
    if (debug) console.warn("[TRUNCATE falló, usando deleteMany()]", e?.message || e);

    // hijos de escrutinio (ya los borramos más arriba, pero por si falla TRUNCATE antes)
    await tx.resultadoVotosEspeciales?.deleteMany?.();
    await tx.resultadoPorAgrupacionPolitica?.deleteMany?.();
    await tx.resultadoPorMesa?.deleteMany?.();
    await tx.diferenciasPorCargosPoliticos?.deleteMany?.();
    await tx.firma?.deleteMany?.();
    await tx.mesaEscrutada?.deleteMany?.();

    // maestro
    await tx.padronElectoral.deleteMany();
    await tx.mesasPorEstablecimiento.deleteMany();
    await tx.establecimiento.deleteMany();
    await tx.circuito.deleteMany();
  }
}

export async function importElectoralRoll({
  buffer,
  userId,
  mode,           // "replace" | "append"
  debug = true,
}: ImportOptions): Promise<ImportResult> {

  // Usa await si parseXlsxToRows es async
  const data = await (parseXlsxToRows as any)(buffer) as unknown as Record<string, any>[];

  if (debug) {
    console.log("[filas XLSX]", data.length);
    if (data.length) console.log("[columnas detectadas]", Object.keys(data[0]));
  }

  const errorDetails: ImportErrorDetail[] = [];

  // ===== 1) TX corta: limpieza + maestros =====
  const txResult = await db.$transaction(async (tx) => {
    // LIMPIEZA DE ESCRUTINIO (hijo → padre)
    await tx.resultadoVotosEspeciales.deleteMany();
    await tx.resultadoPorAgrupacionPolitica.deleteMany();
    await tx.resultadoPorMesa.deleteMany();
    await tx.diferenciasPorCargosPoliticos.deleteMany();
    await tx.firma.deleteMany();
    await tx.mesaEscrutada.deleteMany();
    if (debug) console.log("[LIMPIEZA ESCRUTINIO]");

    if (mode === "replace") {
      await safeTruncateOrDelete(tx, debug);
    }

    // CIRCUITOS
    const nuevosCircuitos = buildCircuitosFromRows(data, { getField, norm, userId, debug });
    const { insertedCircuits, circuitoMap } =
      await persistCircuitos(tx, nuevosCircuitos, debug, { mode, updateOnDuplicateName: false });

    // ESTABLECIMIENTOS
    const nuevosEstablecimientos = buildEstablecimientosFromRows(data, {
      getField, norm, userId, circuitoMap, debug,
    });
    const { insertedEstablishments, establecimientoMapByNombre } =
      await persistEstablecimientos(
        tx,
        nuevosEstablecimientos,
        debug,
        (s) => toUpperEs(norm(s)),
        { mode, updateOnDuplicate: false }
      );

    // MESAS
    const mesasPorEstablecimiento = buildMesasFromRows(data, {
      getField, norm, toInt, userId, establecimientoMapByNombre, debug,
    });
    const { insertedMesas } = await persistMesas(tx, mesasPorEstablecimiento, debug, {
      mode, buildMap: false, updateOnDuplicate: false
    });

    return {
      insertedCircuits,
      insertedEstablishments,
      insertedMesas,
      circuitoMap,
      establecimientoMapByNombre,
    };
  }, {
    timeout: 60_000,   // <- no más de 60s porque no insertamos padrón acá
    maxWait: 30_000,
  });

  // ===== 2) Fuera de la TX: padrón en batches (autocommit) =====
  const { circuitoMap, establecimientoMapByNombre, insertedCircuits, insertedEstablishments, insertedMesas } = txResult;

  const { inserted, processed, errors } = await persistPadronFromRowsBatched(db, data, {
    getField,
    norm,
    toInt,
    userId,
    circuitoMap,
    establecimientoMapByNombre,
    batchSize: Math.max(BATCH_SIZE, 5_000), // subí un poco el batch para menos roundtrips
    skipDuplicates: true,                   // clave en append (requiere UNIQUE cfg)
    onError: (e) => errorDetails.push({
      ...e,
      nombre: e.nombre ?? "",
      apellido: e.apellido ?? "",
    }),
    debug,
    mode,
  });

  // (Estadísticas se corren desde el form/endpoint aparte)

  return {
    rows: inserted,
    people: inserted,
    establishments: insertedEstablishments,
    circuits: insertedCircuits,
    mesasCreadas: insertedMesas,
    errors: errorDetails.length,
    errorDetails
  };
}
