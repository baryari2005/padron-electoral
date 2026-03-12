// import { Prisma } from "@prisma/client";
// import { db } from "@/lib/db";

// export type GroupByMode = "orden" | "referente" | "planillero" | "planilla";

// export function parseGroupBy(value: string | null): GroupByMode {
//   if (value === "referente") return "referente";
//   if (value === "planillero") return "planillero";
//   if (value === "planilla") return "planilla";
//   return "orden";
// }

// export function normalizeVoteValue(value: string | null | undefined): boolean | null {
//   if (value === "S") return true;
//   if (value === "N") return false;
//   return null;
// }

// export async function getActiveElectionId() {
//   const election = await db.eleccion.findFirst({
//     where: { activa: true },
//     select: { id: true },
//   });

//   if (!election) {
//     throw new Error("No hay una elección activa");
//   }

//   return election.id;
// }

// export async function resolveMesaNumero(
//   mesaId: number | undefined,
//   eleccionId: number
// ): Promise<number | undefined> {
//   if (!mesaId || Number.isNaN(mesaId)) return undefined;

//   const mesa = await db.mesasPorEstablecimiento.findFirst({
//     where: {
//       id: mesaId,
//       eleccionId,
//       deletedAt: null,
//     },
//     select: {
//       numero: true,
//     },
//   });

//   return mesa?.numero;
// }

// export async function buildInternalVotingBase(params: {
//   electionId: number;
//   establecimientoId?: number;
//   mesaId?: number;
//   referenteId?: number;
//   planilleroId?: number;
//   q?: string;
// }) {  
//   const eleccionId = params.electionId;
//   const numeroMesa = await resolveMesaNumero(params.mesaId, eleccionId);

//   const and: Prisma.PadronElectoralWhereInput[] = [
//     { eleccionId },
//     { deletedAt: null },
//   ];

//   if (params.establecimientoId && !Number.isNaN(params.establecimientoId)) {
//     and.push({ establecimientoId: params.establecimientoId });
//   }

//   if (numeroMesa && !Number.isNaN(numeroMesa)) {
//     and.push({ numeroMesa });
//   }

//   if (params.referenteId && !Number.isNaN(params.referenteId)) {
//     and.push({ referenteId: params.referenteId });
//   }

//   if (params.planilleroId && !Number.isNaN(params.planilleroId)) {
//     and.push({ planilleroId: params.planilleroId });
//   }

//   const q = (params.q ?? "").trim();

//   if (q) {
//     and.push({
//       OR: [
//         { numeroMatricula: { contains: q, mode: "insensitive" } },
//         { apellido: { contains: q, mode: "insensitive" } },
//         { nombre: { contains: q, mode: "insensitive" } },
//         { telefono: { contains: q, mode: "insensitive" } },

//         {
//           planilla: {
//             is: {
//               OR: [
//                 { numero: { contains: q, mode: "insensitive" } },
//                 { nombre: { contains: q, mode: "insensitive" } },
//               ],
//             },
//           },
//         },

//         {
//           referente: {
//             is: {
//               nombre: { contains: q, mode: "insensitive" },
//             },
//           },
//         },

//         {
//           planillero: {
//             is: {
//               nombre: { contains: q, mode: "insensitive" },
//             },
//           },
//         },

//         {
//           actor: {
//             is: {
//               OR: [
//                 { nombre: { contains: q, mode: "insensitive" } },
//                 { apellido: { contains: q, mode: "insensitive" } },
//                 { telefono: { contains: q, mode: "insensitive" } },
//               ],
//             },
//           },
//         },
//       ],
//     });
//   }

//   return {
//     eleccionId,
//     where: { AND: and } satisfies Prisma.PadronElectoralWhereInput,
//   };
// }
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type GroupByMode = "orden" | "referente" | "planillero" | "planilla";

export function parseGroupBy(value: string | null): GroupByMode {
  if (value === "referente") return "referente";
  if (value === "planillero") return "planillero";
  if (value === "planilla") return "planilla";
  return "orden";
}

export function normalizeVoteValue(
  value: string | null | undefined
): boolean | null {
  if (value === "S") return true;
  if (value === "N") return false;
  return null;
}

export async function getActiveElectionId() {
  const election = await db.eleccion.findFirst({
    where: { activa: true },
    select: { id: true },
  });

  if (!election) {
    throw new Error("No hay una elección activa");
  }

  return election.id;
}

export async function resolveMesaNumero(
  mesaId: number | undefined,
  eleccionId: number
): Promise<number | undefined> {
  if (!mesaId || Number.isNaN(mesaId)) return undefined;

  const mesa = await db.mesasPorEstablecimiento.findFirst({
    where: {
      id: mesaId,
      eleccionId,
      deletedAt: null,
    },
    select: {
      numero: true,
    },
  });

  return mesa?.numero;
}

export async function buildInternalVotingBase(params: {
  electionId: number;
  establecimientoId?: number;
  mesaId?: number;
  referenteId?: number;
  planilleroId?: number;
  planillaId?: number;
  q?: string;
}) {
  const eleccionId = params.electionId;
  const numeroMesa = await resolveMesaNumero(params.mesaId, eleccionId);

  const and: Prisma.PadronElectoralWhereInput[] = [
    { eleccionId },
    { deletedAt: null },
  ];

  if (params.establecimientoId && !Number.isNaN(params.establecimientoId)) {
    and.push({ establecimientoId: params.establecimientoId });
  }

  if (numeroMesa && !Number.isNaN(numeroMesa)) {
    and.push({ numeroMesa });
  }

  if (params.referenteId && !Number.isNaN(params.referenteId)) {
    and.push({ referenteId: params.referenteId });
  }

  if (params.planilleroId && !Number.isNaN(params.planilleroId)) {
    and.push({ planilleroId: params.planilleroId });
  }

  if (params.planillaId && !Number.isNaN(params.planillaId)) {
    and.push({ planillaId: params.planillaId });
  }

  const q = (params.q ?? "").trim();

  if (q) {
    and.push({
      OR: [
        { numeroMatricula: { contains: q, mode: "insensitive" } },
        { apellido: { contains: q, mode: "insensitive" } },
        { nombre: { contains: q, mode: "insensitive" } },
        { telefono: { contains: q, mode: "insensitive" } },

        {
          planilla: {
            is: {
              OR: [
                { numero: { contains: q, mode: "insensitive" } },
                { nombre: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },

        {
          referente: {
            is: {
              nombre: { contains: q, mode: "insensitive" },
            },
          },
        },

        {
          planillero: {
            is: {
              nombre: { contains: q, mode: "insensitive" },
            },
          },
        },

        {
          actor: {
            is: {
              OR: [
                { nombre: { contains: q, mode: "insensitive" } },
                { apellido: { contains: q, mode: "insensitive" } },
                { telefono: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    });
  }

  return {
    eleccionId,
    where: { AND: and } satisfies Prisma.PadronElectoralWhereInput,
  };
}