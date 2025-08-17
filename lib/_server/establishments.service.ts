// lib/_server/establishments.service.ts
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatApiMessage } from "@/lib/utils/formatters";

/* =========================
 * Helpers de búsqueda/orden
 * ========================= */

export function buildEstablecimientoWhere(search: string): Prisma.EstablecimientoWhereInput {
  const terms = search.trim().split(/\s+/).filter(Boolean);

  const where: Prisma.EstablecimientoWhereInput = { deletedAt: null };

  if (!terms.length) return where;

  // AND existente + condiciones nuevas
  const prevAnd = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];

  where.AND = [
    ...prevAnd,
    {
      // OR entre términos en nombre / dirección / circuito.nombre
      OR: terms.map((term) => ({
        OR: [
          { nombre: { contains: term, mode: Prisma.QueryMode.insensitive } },
          { direccion: { contains: term, mode: Prisma.QueryMode.insensitive } },
          { circuito: { nombre: { contains: term, mode: Prisma.QueryMode.insensitive } } },
          { circuito: { codigo: { contains: term, mode: Prisma.QueryMode.insensitive } } },
        ],
      })),
    },
    // opcional: también frase completa
    {
      OR: [
        { nombre: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { direccion: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { circuito: { nombre: { contains: search, mode: Prisma.QueryMode.insensitive } } },
        { circuito: { codigo: { contains: search, mode: Prisma.QueryMode.insensitive } } },
      ],
    },
  ];

  return where;
}

export function buildOrderBy(
  sortBy?: string | null,
  sortDir: "asc" | "desc" = "asc"
): Prisma.EstablecimientoOrderByWithRelationInput {
  switch (sortBy) {
    case "nombre":
      return { nombre: sortDir };
    case "direccion":
      return { direccion: sortDir };
    case "circuitoCodigo":
      return { circuito: { codigo: sortDir } }; // requiere include/join de circuito
    default:
      return { nombre: "asc" }; // orden por defecto
  }
}

/* ===============
 * Consultas utils
 * =============== */

export async function findByNombreInsensitive(nombre: string) {
  return db.establecimiento.findFirst({
    where: { nombre: { equals: nombre, mode: Prisma.QueryMode.insensitive } },
    select: { id: true, deletedAt: true },
  });
}

export async function getById(id: number) {
  return db.establecimiento.findFirst({
    where: { id },
    include: {
      circuito: true,
      mesasPorEstablecimiento: true,
    },
  });
}

/* ==========
 * DTOs
 * ========== */

export type CreateEstablecimientoDTO = {
  nombre: string;
  direccion: string;
  profileImage: string;
  circuitoId: number;
  numerosDeMesa?: number[]; // array de números de mesa (opcional)
  userId: string;
};

export type UpdateEstablecimientoDTO = {
  id: number;
  nombre: string;
  direccion: string;
  profileImage: string;
  circuitoId: number;
  numerosDeMesa: number[];
  userId: string; // requerido por el esquema
};

/* ========================
 * Operaciones de escritura
 * ======================== */

export async function create(input: CreateEstablecimientoDTO) {
  const { userId } = input;
  if (!userId || typeof userId !== "string") {
    throw new Error(formatApiMessage("errors.userNotAuthenticated"));
  }

  const mesasNums = (input.numerosDeMesa ?? []).filter(
    (n) => Number.isFinite(n) && n > 0
  ) as number[];

  // Transacción: crea establecimiento + mesas
  return db.$transaction(async (tx) => {
    const establecimiento = await tx.establecimiento.create({
      data: {
        nombre: input.nombre,
        direccion: input.direccion,
        profileImage: input.profileImage,
        circuito: { connect: { id: input.circuitoId } },
        userId,
      },
    });

    if (mesasNums.length) {
      await tx.mesasPorEstablecimiento.createMany({
        data: mesasNums.map((numero) => ({
          numero,
          establecimientoId: establecimiento.id,
          userId,
        })),
        skipDuplicates: true, // respeta @@unique([establecimientoId, numero])
      });
    }

    return tx.establecimiento.findUnique({
      where: { id: establecimiento.id },
      include: { mesasPorEstablecimiento: true, circuito: true },
    });
  });
}

export async function update(input: UpdateEstablecimientoDTO) {
  const { id, nombre, direccion, profileImage, circuitoId, numerosDeMesa, userId } = input;

  if (!userId) {
    throw new Error(formatApiMessage("errors.userNotAuthenticated"));
  }

  // Update atómico con nested ops
  return db.establecimiento.update({
    where: { id },
    data: {
      nombre,
      direccion,
      profileImage,
      circuitoId,
      userId,
      mesasPorEstablecimiento: {
        deleteMany: {}, // borra todas las mesas actuales
        create: numerosDeMesa
          .filter((n) => Number.isFinite(n) && n > 0)
          .map((numero) => ({ numero, userId })),
      },
    },
    include: { mesasPorEstablecimiento: true, circuito: true },
  });
}

export async function softDelete(id: number, userId?: string) {
  // marca establecimiento + mesas como borradas (soft)
  return db.$transaction([
    db.mesasPorEstablecimiento.updateMany({
      where: { establecimientoId: id },
      data: { deletedAt: new Date(), userId },
    }),
    db.establecimiento.update({
      where: { id },
      data: { deletedAt: new Date(), userId },
    }),
  ]);
}

export async function resurrect(id: number, userId: string) {
  if (!userId || typeof userId !== "string") {
    throw new Error(formatApiMessage("errors.userNotAuthenticated"));
  }

  return db.establecimiento.update({
    where: { id },
    data: {
      userId,
      deletedAt: null,
    },
  });
}
