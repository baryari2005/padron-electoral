// src/lib/establecimientos.ts
import { stripLeadingZeros } from "../features/utils/stripLeadingZeros";
import { toUpperEs } from "../features/utils/toUpperEs";
import { DbClient } from "./dbTypes";

export type ImportMode = "replace" | "append";

export type NuevoEstablecimiento = {
  nombre: string;
  direccion: string;
  circuitoId: number;
  userId: string;
  eleccionId: number;
};

const CIRCUITO_KEYS = [
  "TX_CIRCUITO",
  "TX CIRCUITO",
  "CIRCUITO",
  "COD_CIRC",
  "CODIGO_CIRCUITO",
];

const ESTABLECIMIENTO_KEYS = [
  "ESTABLECIMIENTO",
  "ESTBLECIMIENTO", // tolerante a typo
  "TX_ESTABLECIMIENTO",
  "NOMBRE_ESTABLECIMIENTO",
];

const DIRECCION_KEYS = [
  "DIRECCION_ESTABLECIMIENTO",
  "DIRECCIÓN_ESTABLECIMIENTO",
  "ESTABLECIMIENTO_DIRECCION",
  "DOMICILIO_EST",
  "DIRECCION",
  "DIRECCIÓN",
];

/**
 * Construye establecimientos a partir de XLSX.
 * - Normaliza y pasa a MAYÚSCULAS (nombre/dirección)
 * - Resuelve circuitoId desde circuitoMap (código sin ceros a la izq.)
 * - Dedup por **nombre** (si hay repetidos con distinta dirección, prioriza la que NO está vacía)
 *
 * ⚠️ Si tenés el mismo nombre en distintos circuitos, considerá deduplicar por (circuitoId + nombre).
 */
export function buildEstablecimientosFromRows<T extends Record<string, any>>(
  data: T[],
  opts: {
    getField: (row: T, keys: string[]) => string;
    norm: (s: string) => string;
    userId: string;
    circuitoMap: Map<string, number>; // codigoCircuito (sin ceros) -> id    
    debug?: boolean;
    eleccionId: number;
  }
): NuevoEstablecimiento[] {
  const { getField, norm, userId, circuitoMap, debug, eleccionId } = opts;

  let total = 0;
  let skipSinNombre = 0;
  let skipSinCircuito = 0;

  // Deduplicamos por NOMBRE (clave = nombreUC)
  const byNombre = new Map<string, NuevoEstablecimiento>();

  for (const row of data) {
    total++;

    const circuitoTxt = norm(getField(row, CIRCUITO_KEYS)); // ej "001 - Centro"
    const [codigoRaw] = (circuitoTxt ?? "").split(/\s*-\s*/);
    const codigoCircuito = stripLeadingZeros(norm(codigoRaw));
    const circuitoId = circuitoMap.get(codigoCircuito);

    const nombreUC = toUpperEs(norm(getField(row, ESTABLECIMIENTO_KEYS)));
    const direccionUC = toUpperEs(norm(getField(row, DIRECCION_KEYS)));

    if (!nombreUC) {
      skipSinNombre++;
      continue;
    }
    if (!circuitoId) {
      // si no hay circuito, no podemos relacionar
      skipSinCircuito++;
      continue;
    }

    const current = byNombre.get(nombreUC);
    if (!current) {
      byNombre.set(nombreUC, {
        nombre: nombreUC,
        direccion: direccionUC,
        circuitoId,
        userId,
        eleccionId,
      });
    } else {
      // Si ya existe, priorizamos mantener una dirección NO vacía
      if (!current.direccion && direccionUC) {
        byNombre.set(nombreUC, {
          nombre: nombreUC,
          direccion: direccionUC,
          circuitoId,
          userId,
          eleccionId,
        });
      }
      // (Opcional) actualizar circuitoId si lo querés “corregir” ante conflictos
    }
  }

  const result = Array.from(byNombre.values());

  if (debug) {
    console.log(
      `🏫 establecimientos vistos: ${total} | únicos por nombre: ${result.length} | sin nombre: ${skipSinNombre} | sin circuito: ${skipSinCircuito}`
    );
  }

  return result;
}

/**
 * Inserta/actualiza establecimientos y retorna un mapa por **NOMBRE**:
 *   clave = normalizeKey(nombre) → id
 *
 * - replace: inserta directo (se asume TRUNCATE previo).
 * - append : createMany + skipDuplicates (requiere índice único) o upsert para refrescar datos.
 *
 * Índices recomendados (elegí uno):
 * -- Único por nombre (simple):
 *    CREATE UNIQUE INDEX IF NOT EXISTS ux_estab_nombre ON "Establecimiento" ("nombre");
 * -- Único compuesto por circuito+nombre (preferible si hay homónimos):
 *    CREATE UNIQUE INDEX IF NOT EXISTS ux_estab_circ_nombre ON "Establecimiento" ("circuitoId","nombre");
 */
export async function persistEstablecimientos(
  prisma: DbClient,
  establecimientos: NuevoEstablecimiento[],
  debug = false,
  normalizeKey: (s: string) => string,
  opts?: { mode?: ImportMode; updateOnDuplicate?: boolean } // updateOnDuplicate => usa upsert para refrescar direccion/circuito
): Promise<{
  insertedEstablishments: number;
  establecimientoMapByNombre: Map<string, number>;
}> {
  if (!establecimientos.length) {
    throw new Error("No se detectaron establecimientos válidos en el archivo.");
  }

  const mode: ImportMode = opts?.mode ?? "append";
  const updateOnDuplicate = opts?.updateOnDuplicate ?? false;

  let insertedEstablishments = 0;

  if (mode === "replace") {
    // Tabla vacía (TRUNCATE en el orquestador) → inserción directa
    const res = await prisma.establecimiento.createMany({
      data: establecimientos,
      skipDuplicates: false,
    });
    insertedEstablishments = res.count;
  } else {
    // APPEND
    if (updateOnDuplicate) {
      // Mantener datos al día cuando ya existe (más IO que createMany)
      // ⚠️ Ajustá el 'where' a TU clave única real.
      let count = 0;
      for (const e of establecimientos) {
        await prisma.establecimiento.upsert({
          // Si tenés UNIQUE(nombre):
          where: {
            nombre_direccion_eleccionId: {
              nombre: e.nombre,
              direccion: e.direccion,
              eleccionId: e.eleccionId,
            },
          },
          create: e,
          update: {
            direccion: e.direccion,  // refrescá los campos que quieras actualizar
            // circuitoId: e.circuitoId, // si querés permitir “mover” de circuito (cuidado con FKs)
            userId: e.userId,
          },
        });
        count++;
      }
      insertedEstablishments = count; // operaciones realizadas (no “nuevas filas” estrictamente)
    } else {
      // Rápido: createMany + skipDuplicates (requiere índice único)
      const res = await prisma.establecimiento.createMany({
        data: establecimientos,
        skipDuplicates: true,
      });
      insertedEstablishments = res.count;
    }
  }

  // Traemos solo los nombres involucrados en esta importación
  const nombres = Array.from(new Set(establecimientos.map((e) => e.nombre)));

  const eleccionId = establecimientos[0].eleccionId;

  const establecimientosDB = await prisma.establecimiento.findMany({
    where: {
      eleccionId,
      nombre: { in: nombres },
    },
    select: { id: true, nombre: true },
  });

  const establecimientoMapByNombre = new Map<string, number>();
  for (const e of establecimientosDB) {
    establecimientoMapByNombre.set(normalizeKey(e.nombre), e.id);
  }

  if (debug) {
    console.log("🏷️ establecimientoMapByNombre size:", establecimientoMapByNombre.size);
    console.log(
      `✅ persistEstablecimientos: mode=${mode} inserted=${insertedEstablishments} map=${establecimientoMapByNombre.size}`
    );
  }

  return { insertedEstablishments, establecimientoMapByNombre };
}
