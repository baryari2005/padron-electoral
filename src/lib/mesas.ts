import { toUpperEs } from "../features/utils/toUpperEs";
import { DbClient } from "./dbTypes";

export type ImportMode = "replace" | "append";

export type NuevaMesa = {
  numero: number;
  establecimientoId: number;
  userId: string;
};

const ESTABLECIMIENTO_KEYS = [
  "ESTABLECIMIENTO",
  "ESTBLECIMIENTO",
  "TX_ESTABLECIMIENTO",
  "NOMBRE_ESTABLECIMIENTO",
];

const MESA_KEYS = ["NUMERO_MESA", "NRO_MESA", "MESA"];

/**
 * Construye la lista deduplicada de mesas por establecimiento:
 * - Resuelve establecimiento **solo por nombre**
 * - Normaliza y pone NOMBRE en MAYÚSCULAS
 * - Dedup por (establecimientoId, numero)
 */
export function buildMesasFromRows<T extends Record<string, any>>(
  data: T[],
  opts: {
    getField: (row: T, keys: string[]) => string;
    norm: (s: string) => string;
    toInt: (s: string | number) => number;
    userId: string;
    establecimientoMapByNombre: Map<string, number>; // clave = toUpperEs(norm(nombre))
    debug?: boolean;
  }
): NuevaMesa[] {
  const { getField, norm, toInt, userId, establecimientoMapByNombre, debug } = opts;

  let totalVistos = 0;
  let skipSinNombre = 0;
  let skipSinEstab = 0;
  let skipSinMesa = 0;

  const dedup = new Map<string, NuevaMesa>(); // clave: establecimientoId|numero

  for (const row of data) {
    totalVistos++;

    const nombreUC = toUpperEs(norm(getField(row, ESTABLECIMIENTO_KEYS)));
    if (!nombreUC) {
      skipSinNombre++;
      continue;
    }

    const numeroMesa = toInt(getField(row, MESA_KEYS));
    if (!numeroMesa || Number.isNaN(numeroMesa) || numeroMesa <= 0) {
      skipSinMesa++;
      continue;
    }

    const establecimientoId = establecimientoMapByNombre.get(nombreUC);
    if (!establecimientoId) {
      skipSinEstab++;
      continue;
    }

    const key = `${establecimientoId}|${numeroMesa}`;
    if (!dedup.has(key)) {
      dedup.set(key, { numero: numeroMesa, establecimientoId, userId });
    }
  }

  const result = Array.from(dedup.values());

  if (debug) {
    console.log(
      `🪑 mesas vistas: ${totalVistos} | válidas: ${result.length} | ` +
      `sin nombre: ${skipSinNombre} | sin establecimiento: ${skipSinEstab} | sin número: ${skipSinMesa}`
    );
  }

  return result;
}

/**
 * Inserta/actualiza mesas y (opcionalmente) retorna un mapa (establecimientoId|numero) -> id
 *
 * - replace: inserta directo (se asume TRUNCATE previo).
 * - append : createMany + skipDuplicates (rápido) o upsert para refrescar datos existentes.
 *
 * Requiere clave única compuesta en Prisma:
 *   @@unique([establecimientoId, numero], name: "establecimientoId_numero")
 */
export async function persistMesas(
  prisma: DbClient,
  mesas: NuevaMesa[],
  debug = false,
  opts?: {
    mode?: ImportMode;
    buildMap?: boolean;          // si querés que devuelva mesaMap
    updateOnDuplicate?: boolean; // si querés refrescar userId u otros campos al existir la mesa
  }
): Promise<{ insertedMesas: number; mesaMap?: Map<string, number> }> {
  if (!mesas.length) {
    throw new Error("No se detectaron mesas válidas en el archivo.");
  }

  const mode: ImportMode = opts?.mode ?? "append";
  const buildMap = opts?.buildMap ?? false;
  const updateOnDuplicate = opts?.updateOnDuplicate ?? false;

  let insertedMesas = 0;

  if (mode === "replace") {
    // Tabla vacía (TRUNCATE en el orquestador) → inserción directa
    const res = await prisma.mesasPorEstablecimiento.createMany({
      data: mesas,
      skipDuplicates: false,
    });
    insertedMesas = res.count;
  } else {
    // APPEND
    if (updateOnDuplicate) {
      // Upsert por clave compuesta: establecimientoId + numero
      // ⚠️ el nombre del campo de where compuesta depende de tu @@unique name
      // Si en tu schema es `name: "establecimientoId_numero"`, Prisma genera `establecimientoId_numero`
      let ops = 0;
      for (const m of mesas) {
        await prisma.mesasPorEstablecimiento.upsert({
          where: {
            // usa el nombre que existe en tu client d.ts
            numero_establecimientoId: { // <-- probablemente este
              numero: m.numero,
              establecimientoId: m.establecimientoId,
            },
          },
          create: m,
          update: { userId: m.userId },
        });
        ops++;
      }
      insertedMesas = ops; // operaciones realizadas (no necesariamente filas nuevas)
    } else {
      // Rápido: inserción masiva sin duplicar (requiere @@unique compuesto)
      const res = await prisma.mesasPorEstablecimiento.createMany({
        data: mesas,
        skipDuplicates: true,
      });
      insertedMesas = res.count;
    }
  }

  if (!buildMap) {
    if (debug) console.log("🪑 mesas creadas/afectadas:", insertedMesas);
    return { insertedMesas };
  }

  // Construir mapa solo para las mesas involucradas en esta corrida
  const mesasDB = await prisma.mesasPorEstablecimiento.findMany({
    where: {
      OR: mesas.map((m) => ({
        numero: m.numero,
        establecimientoId: m.establecimientoId,
      })),
    },
    select: { id: true, numero: true, establecimientoId: true },
  });

  const mesaMap = new Map<string, number>();
  for (const m of mesasDB) {
    mesaMap.set(`${m.establecimientoId}|${m.numero}`, m.id);
  }

  if (debug) console.log("🗂️ mesaMap size:", mesaMap.size);

  return { insertedMesas, mesaMap };
}
