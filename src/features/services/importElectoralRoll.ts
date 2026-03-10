// src/features/services/importElectoralRoll.ts
"use server";

import { db } from "@/lib/db";
import { parseXlsxToRows } from "../parsers/parseXlsx";
import { norm, toInt } from "../utils/strings";
import type {
  ImportErrorDetail,
  ImportOptions,
  ImportResult,
} from "../electoral-rolls/types";
import { BATCH_SIZE } from "../electoral-rolls/constants";
import { getField } from "../utils/rowGet";
import {
  buildCircuitosFromRows,
  persistCircuitos,
} from "@/src/lib/circuitos";
import {
  buildEstablecimientosFromRows,
  persistEstablecimientos,
} from "@/src/lib/establecimientos";
import { buildMesasFromRows, persistMesas } from "@/src/lib/mesas";
import { toUpperEs } from "../utils/toUpperEs";
import { persistPadronFromRowsBatched } from "@/src/lib/padron";


import { replaceElectionData } from "@/lib/elections/replaceElectionData";
import { getActiveElection } from "@/lib/elections/getActiveElection";

export async function importElectoralRoll({
  buffer,
  userId,
  mode,
  debug = true,
}: ImportOptions): Promise<ImportResult> {
  const election = await getActiveElection();
  if (!election) {
    throw new Error("No hay elección activa");
  }

  const eleccionId = election.id;


  const data = (await parseXlsxToRows(buffer)) as Record<string, any>[];

  if (debug) {
    console.log("[filas XLSX]", data.length);
    if (data.length)
      console.log("[columnas detectadas]", Object.keys(data[0]));
  }

  const errorDetails: ImportErrorDetail[] = [];

  // ===============================
  // PREPROCESAR PERSONAS Y PLANILLAS
  // ===============================

  const personasMap = new Map<
    string,
    { nombre: string; telefono?: string; tipo: string }
  >();

  const planillasSet = new Set<string>();

  for (const row of data) {
    const referente = norm(getField(row, ["REFERENTE"]));
    const telRef = norm(getField(row, ["CONTACTO_REFERENTE"]));

    if (referente) {
      const key = `${referente.toUpperCase()}|REFERENTE`;
      personasMap.set(key, {
        nombre: referente.toUpperCase(),
        telefono: telRef,
        tipo: "REFERENTE",
      });
    }

    const planillero = norm(getField(row, ["PLANILLERO"]));
    const telPla = norm(getField(row, ["CONTACTO_PLANILLERO"]));

    if (planillero) {
      const key = `${planillero.toUpperCase()}|PLANILLERO`;
      personasMap.set(key, {
        nombre: planillero.toUpperCase(),
        telefono: telPla,
        tipo: "PLANILLERO",
      });
    }

    const chofer = norm(getField(row, ["CHOFER"]));
    const telCho = norm(getField(row, ["CONTACTO_CHOFER"]));

    if (chofer) {
      const key = `${chofer.toUpperCase()}|CHOFER`;
      personasMap.set(key, {
        nombre: chofer.toUpperCase(),
        telefono: telCho,
        tipo: "CHOFER",
      });
    }

    const planilla = norm(getField(row, ["NUMERO_PLANILLA"]));
    if (planilla) planillasSet.add(planilla.trim());
  }

  // ===============================
  // TRANSACTION MAESTROS
  // ===============================

  const txResult = await db.$transaction(async (tx) => {
    if (mode === "replace") {
      await replaceElectionData(tx, eleccionId!);
    }

    // PERSONAS
    if (personasMap.size > 0) {
      await tx.personaOperativa.createMany({
        data: Array.from(personasMap.values()).map((p) => ({
          ...p,
          eleccionId,
        })),
        skipDuplicates: true,
      });
    }

    const statsPersonas = {
      REFERENTE: 0,
      PLANILLERO: 0,
      CHOFER: 0,
    };

    for (const p of Array.from(personasMap.values())) {
      if (p.tipo === "REFERENTE") statsPersonas.REFERENTE++;
      if (p.tipo === "PLANILLERO") statsPersonas.PLANILLERO++;
      if (p.tipo === "CHOFER") statsPersonas.CHOFER++;
    }

    const personasDB = await tx.personaOperativa.findMany({
      where: { eleccionId },
    });

    const personaIdMap = new Map<string, number>();

    for (const p of personasDB) {
      const key = `${p.nombre}|${p.tipo}`;
      personaIdMap.set(key, p.id);
    }

    // PLANILLAS
    if (planillasSet.size > 0) {
      await tx.planilla.createMany({
        data: Array.from(planillasSet).map((numero) => ({
          numero,
          eleccionId,
        })),
        skipDuplicates: true,
      });
    }

    const planillasDB = await tx.planilla.findMany({
      where: {
        eleccionId,
        numero: { in: Array.from(planillasSet) },
      },
    });

    const planillaIdMap = new Map<string, number>();
    for (const p of planillasDB) {
      planillaIdMap.set(p.numero, p.id);
    }

    // CIRCUITOS
    const nuevosCircuitos = buildCircuitosFromRows(data, {
      getField,
      norm,
      userId,
      debug,
      eleccionId,
    });

    const { insertedCircuits, circuitoMap } =
      await persistCircuitos(tx, nuevosCircuitos, debug, {
        mode,
      });

    // ESTABLECIMIENTOS
    const nuevosEstablecimientos = buildEstablecimientosFromRows(data, {
      getField,
      norm,
      userId,
      circuitoMap,
      debug,
      eleccionId,
    });

    const { insertedEstablishments, establecimientoMapByNombre } =
      await persistEstablecimientos(
        tx,
        nuevosEstablecimientos,
        debug,
        (s) => toUpperEs(norm(s)),
        { mode }
      );

    // MESAS
    const mesasPorEstablecimiento = buildMesasFromRows(data, {
      getField,
      norm,
      toInt,
      userId,
      establecimientoMapByNombre,
      debug,
      eleccionId,
    });

    const { insertedMesas } = await persistMesas(
      tx,
      mesasPorEstablecimiento,
      debug,
      { mode }
    );

    return {
      insertedCircuits,
      insertedEstablishments,
      insertedMesas,
      circuitoMap,
      establecimientoMapByNombre,
      personaIdMap,
      planillaIdMap,
      statsPersonas,
    };
  }, {
    timeout: 60_000,   // 60 segundos
    maxWait: 30_000,
  });

  // ===============================
  // PADRON EN BATCHES
  // ===============================

  const {
    circuitoMap,
    establecimientoMapByNombre,
    personaIdMap,
    planillaIdMap,
    insertedCircuits,
    insertedEstablishments,
    insertedMesas,
  } = txResult;

  const { inserted } = await persistPadronFromRowsBatched(db, data, {    
    getField,
    norm,
    toInt,
    userId,
    circuitoMap,
    establecimientoMapByNombre,
    personaIdMap,
    planillaIdMap,
    eleccionId,
    batchSize: Math.max(BATCH_SIZE, 5000),
    skipDuplicates: true,
    onError: (e) =>
      errorDetails.push({
        ...e,
        nombre: e.nombre ?? "",
        apellido: e.apellido ?? "",
      }),
    debug,
    mode,
  });

  return {
    rows: inserted,
    people: inserted,
    establishments: insertedEstablishments,
    circuits: insertedCircuits,
    mesasCreadas: insertedMesas,
    errors: errorDetails.length,
    errorDetails,
    statsPersonas: txResult.statsPersonas
  };
}