// // src/lib/circuitos.ts
// import { stripLeadingZeros } from "../features/utils/stripLeadingZeros";
// import { DbClient } from "./dbTypes";

// export type ImportMode = "replace" | "append";

// export type NuevoCircuito = {
//   codigo: string;
//   nombre: string;
//   userId: string;
//   eleccionId: number;
// };

// export function buildCircuitosFromRows<T extends Record<string, any>>(
//   data: T[],
//   opts: {
//     getField: (row: T, keys: string[]) => string;
//     norm: (s: string) => string;
//     userId: string;
//     eleccionId: number;
//     debug?: boolean;
//   }
// ): NuevoCircuito[] {
//   const { getField, norm, userId, eleccionId, debug } = opts;

//   const circuitosUnicos = Array.from(
//     new Set(
//       data.map((row) => norm(getField(row, ["TX_CIRCUITO", "COD_CIRC", "CIRCUITO"])))
//     )
//   ).filter(Boolean);

//   const preliminares = circuitosUnicos
//     .map((raw) => {
//       const [codigoRaw, nombreRaw] = (raw ?? "").split(/\s*-\s*/);
//       const codigo = stripLeadingZeros(norm(codigoRaw));
//       const nombre = norm(nombreRaw ?? codigoRaw);
//       return { codigo, nombre, userId, eleccionId };
//     })
//     .filter((c) => !!c.codigo);

//   // Deduplicar por código ya normalizado
//   const mapa = new Map<string, NuevoCircuito>();
//   for (const c of preliminares)
//     if (!mapa.has(c.codigo)) mapa.set(c.codigo, c);

//   const nuevosCircuitos = Array.from(mapa.values());

//   if (debug) console.log("🧭 circuitos únicos (no vacíos):", nuevosCircuitos.length);
//   return nuevosCircuitos;
// }

// /**
//  * Inserta/actualiza circuitos y devuelve un map codigo -> id.
//  * - replace: inserta directo (se asume que la tabla fue truncada antes).
//  * - append : createMany con skipDuplicates **o** upsert por si querés actualizar nombre.
//  *
//  * Requiere índice único en "codigo":
//  *   CREATE UNIQUE INDEX IF NOT EXISTS ux_circuito_codigo ON "Circuito" ("codigo");
//  */
// export async function persistCircuitos(
//   prisma: DbClient,               // tipado
//   circuitos: NuevoCircuito[],
//   debug = false,
//   opts?: { mode?: ImportMode; updateOnDuplicateName?: boolean } // updateOnDuplicateName = true => hace upsert para refrescar el nombre
// ): Promise<{ insertedCircuits: number; circuitoMap: Map<string, number> }> {
//   if (!circuitos.length) {
//     throw new Error(
//       "No se detectaron circuitos en el archivo (revisá la columna TX_CIRCUITO / alias)."
//     );
//   }

//   const mode: ImportMode = opts?.mode ?? "append";
//   const updateOnDuplicateName = opts?.updateOnDuplicateName ?? false;

//   let insertedCircuits = 0;

//   if (mode === "replace") {
//     // Tabla ya vacía por TRUNCATE en el orquestador: inserción directa, más rápida.
//     const res = await prisma.circuito.createMany({
//       data: circuitos,
//       skipDuplicates: true, // no hace falta, la tabla está limpia
//     });
//     insertedCircuits = res.count;
//   } else {
//     // APPEND
//     if (updateOnDuplicateName) {
//       // Si querés refrescar el nombre cuando ya existe el código (upsert por clave natural)
//       // (más costoso que createMany, pero mantiene nombres al día)
//       let count = 0;
//       for (const c of circuitos) {
//         await prisma.circuito.upsert({
//           where: {
//             codigo_eleccionId: {
//               codigo: c.codigo,
//               eleccionId: c.eleccionId,
//             },
//           },
//           create: c,
//           update: { nombre: c.nombre, userId: c.userId }, // ajustá qué campos querés actualizar
//         });
//         count++;
//       }
//       insertedCircuits = count; // "operaciones realizadas" (no necesariamente nuevas filas)
//     } else {
//       // Rápido: createMany + skipDuplicates (requiere índice único en codigo)
//       const res = await prisma.circuito.createMany({
//         data: circuitos,
//         skipDuplicates: true,
//       });
//       insertedCircuits = res.count;
//     }
//   }

//   // Mapear codigo -> id (solo de los códigos involucrados en esta corrida)
//   const circuitoMap = new Map<string, number>();
//   const circuitosDB = await prisma.circuito.findMany({
//     where: {
//       eleccionId: circuitos[0].eleccionId,
//       codigo: { in: circuitos.map((c) => c.codigo) },
//     },
//     select: { id: true, codigo: true },
//   });
//   for (const c of circuitosDB) circuitoMap.set(c.codigo, c.id);

//   if (debug) {
//     console.log("🗺️ circuitoMap size:", circuitoMap.size);
//     console.log(
//       `✅ persistCircuitos: mode=${mode} inserted=${insertedCircuits} totalMap=${circuitoMap.size}`
//     );
//   }

//   return { insertedCircuits, circuitoMap };
// }


import { stripLeadingZeros } from "../features/utils/stripLeadingZeros";
import { DbClient } from "./dbTypes";

export type ImportMode = "replace" | "append";

export type NuevoCircuito = {
  codigo: string;
  nombre: string;  
  userId: string;
  eleccionId: number;
};

export function buildCircuitosFromRows<T extends Record<string, any>>(
  data: T[],
  opts: {
    getField: (row: T, keys: string[]) => string;
    norm: (s: string) => string;
    userId: string;
    eleccionId: number;
    debug?: boolean;
  }
): NuevoCircuito[] {
  const { getField, norm, userId, eleccionId, debug } = opts;

  const preliminares = data
    .map((row) => {
      const raw = norm(
        getField(row, ["TX_CIRCUITO", "COD_CIRC", "CIRCUITO"])
      );

      const descripcion = norm(
        getField(row, [
          "DESC_CIRCUITO",
          "DESCRIPCION_CIRCUITO",
          "CIRCUITO_DESC",
          "DESCRIPCION",
          "DESC_CIRC",
        ])
      );

      const [codigoRaw, nombreRaw] = (raw ?? "").split(/\s*-\s*/);

      const codigo = stripLeadingZeros(norm(codigoRaw));
      const nombre = descripcion || norm(nombreRaw ?? codigoRaw);

      return {
        codigo,
        nombre,        
        userId,
        eleccionId,
      };
    })
    .filter((c) => !!c.codigo);

  // Deduplicar por código ya normalizado
  const mapa = new Map<string, NuevoCircuito>();

  for (const c of preliminares) {
    if (!mapa.has(c.codigo)) {
      mapa.set(c.codigo, c);
    }
  }

  const nuevosCircuitos = Array.from(mapa.values());

  if (debug) {
    console.log("🧭 circuitos únicos (no vacíos):", nuevosCircuitos.length);
  }

  return nuevosCircuitos;
}

/**
 * Inserta/actualiza circuitos y devuelve un map codigo -> id.
 * - replace: inserta directo (se asume que la tabla fue truncada antes).
 * - append : createMany con skipDuplicates **o** upsert por si querés actualizar nombre/descripcion.
 *
 * Requiere índice único compuesto:
 * @@unique([codigo, eleccionId])
 */
export async function persistCircuitos(
  prisma: DbClient,
  circuitos: NuevoCircuito[],
  debug = false,
  opts?: {
    mode?: ImportMode;
    updateOnDuplicateName?: boolean;
  }
): Promise<{ insertedCircuits: number; circuitoMap: Map<string, number> }> {
  if (!circuitos.length) {
    throw new Error(
      "No se detectaron circuitos en el archivo (revisá la columna TX_CIRCUITO / alias)."
    );
  }

  const mode: ImportMode = opts?.mode ?? "append";
  const updateOnDuplicateName = opts?.updateOnDuplicateName ?? false;

  let insertedCircuits = 0;

  if (mode === "replace") {
    // Tabla ya vacía por TRUNCATE en el orquestador
    const res = await prisma.circuito.createMany({
      data: circuitos,
      skipDuplicates: true,
    });

    insertedCircuits = res.count;
  } else {
    // APPEND
    if (updateOnDuplicateName) {
      let count = 0;

      for (const c of circuitos) {
        await prisma.circuito.upsert({
          where: {
            codigo_eleccionId: {
              codigo: c.codigo,
              eleccionId: c.eleccionId,
            },
          },
          create: c,
          update: {
            nombre: c.nombre,            
            userId: c.userId,
          },
        });

        count++;
      }

      insertedCircuits = count;
    } else {
      const res = await prisma.circuito.createMany({
        data: circuitos,
        skipDuplicates: true,
      });

      insertedCircuits = res.count;
    }
  }

  // Mapear codigo -> id
  const circuitoMap = new Map<string, number>();

  const circuitosDB = await prisma.circuito.findMany({
    where: {
      eleccionId: circuitos[0].eleccionId,
      codigo: {
        in: circuitos.map((c) => c.codigo),
      },
    },
    select: {
      id: true,
      codigo: true,
    },
  });

  for (const c of circuitosDB) {
    circuitoMap.set(c.codigo, c.id);
  }

  if (debug) {
    console.log("🗺️ circuitoMap size:", circuitoMap.size);
    console.log(
      `✅ persistCircuitos: mode=${mode} inserted=${insertedCircuits} totalMap=${circuitoMap.size}`
    );
  }

  return {
    insertedCircuits,
    circuitoMap,
  };
}