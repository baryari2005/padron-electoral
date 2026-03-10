// lib/_server/establishments.service.ts

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatApiMessage } from "@/lib/utils/formatters";

/* =========================
   Filters
========================= */

export function buildEstablecimientoWhere(
  search: string
): Prisma.EstablecimientoWhereInput {
  const terms = search.trim().split(/\s+/).filter(Boolean);

  if (!terms.length) return {};

  return {
    AND: [
      {
        OR: terms.map((term) => ({
          OR: [
            { nombre: { contains: term, mode: Prisma.QueryMode.insensitive } },
            { direccion: { contains: term, mode: Prisma.QueryMode.insensitive } },
            { circuito: { nombre: { contains: term, mode: Prisma.QueryMode.insensitive } } },
            { circuito: { codigo: { contains: term, mode: Prisma.QueryMode.insensitive } } },
          ],
        })),
      },
      {
        OR: [
          { nombre: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { direccion: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { circuito: { nombre: { contains: search, mode: Prisma.QueryMode.insensitive } } },
          { circuito: { codigo: { contains: search, mode: Prisma.QueryMode.insensitive } } },
        ],
      },
    ],
  };
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
      return { circuito: { codigo: sortDir } };
    default:
      return { nombre: "asc" };
  }
}

/* =========================
   Queries
========================= */

export async function findByNombreInsensitive(
  nombre: string,
  eleccionId: number
) {
  return db.establecimiento.findFirst({
    where: {
      nombre: { equals: nombre, mode: Prisma.QueryMode.insensitive },
      eleccionId,
    },
    select: { id: true, deletedAt: true },
  });
}

export async function getById(id: number, eleccionId: number) {
  return db.establecimiento.findFirst({
    where: { id, eleccionId },
    include: {
      circuito: true,
      mesasPorEstablecimiento: true,
    },
  });
}

/* =========================
   DTOs
========================= */

export type CreateEstablecimientoDTO = {
  nombre: string;
  direccion: string;
  profileImage?: string;
  circuitoId: number;
  numerosDeMesa?: number[];
  userId: string;
  eleccionId: number;
};

export type UpdateEstablecimientoDTO = {
  id: number;
  nombre: string;
  direccion: string;
  profileImage?: string;
  circuitoId: number;
  numerosDeMesa: number[];
  userId: string;
  eleccionId: number;
};

/* =========================
   Create
========================= */

export async function create(input: CreateEstablecimientoDTO) {
  const { userId, eleccionId } = input;

  if (!userId) {
    throw new Error(formatApiMessage("errors.userNotAuthenticated"));
  }

  const mesasNums = (input.numerosDeMesa ?? []).filter(
    (n) => Number.isFinite(n) && n > 0
  );

  return db.$transaction(async (tx) => {
    const establecimiento = await tx.establecimiento.create({
      data: {
        nombre: input.nombre,
        direccion: input.direccion,
        profileImage: input.profileImage,
        circuito: { connect: { id: input.circuitoId } },
        eleccion: { connect: { id: eleccionId } },
        userId,
      },
    });

    if (mesasNums.length > 0) {
      await tx.mesasPorEstablecimiento.createMany({
        data: mesasNums.map((numero) => ({
          numero,
          establecimientoId: establecimiento.id,
          userId,
          eleccionId,
        })),
        skipDuplicates: true,
      });
    }

    return tx.establecimiento.findUnique({
      where: { id: establecimiento.id },
      include: {
        mesasPorEstablecimiento: true,
        circuito: true,
      },
    });
  });
}

/* =========================
   Update
========================= */

export async function update(input: UpdateEstablecimientoDTO) {
  const {
    id,
    nombre,
    direccion,
    profileImage,
    circuitoId,
    numerosDeMesa,
    userId,
    eleccionId,
  } = input;

  if (!userId) {
    throw new Error(formatApiMessage("errors.userNotAuthenticated"));
  }

  const mesasFiltradas = numerosDeMesa.filter(
    (n) => Number.isFinite(n) && n > 0
  );

  return db.establecimiento.update({
    where: { id },
    data: {
      nombre,
      direccion,
      profileImage,
      circuitoId,
      userId,
      mesasPorEstablecimiento: {
        deleteMany: { eleccionId },
        create: mesasFiltradas.map((numero) => ({
          numero,
          userId,
          eleccionId,
        })),
      },
    },
    include: {
      mesasPorEstablecimiento: true,
      circuito: true,
    },
  });
}

/* =========================
   Soft Delete
========================= */

export async function softDelete(
  id: number,
  eleccionId: number,
  userId?: string
) {
  return db.$transaction([
    db.mesasPorEstablecimiento.updateMany({
      where: { establecimientoId: id, eleccionId },
      data: { deletedAt: new Date(), userId },
    }),
    db.establecimiento.update({
      where: { id },
      data: { deletedAt: new Date(), userId },
    }),
  ]);
}

/* =========================
   Resurrect
========================= */

export async function resurrect(
  id: number,
  eleccionId: number,
  userId: string
) {
  if (!userId) {
    throw new Error(formatApiMessage("errors.userNotAuthenticated"));
  }

  return db.establecimiento.update({
    where: { id },
    data: {
      deletedAt: null,
      userId,
    },
  });
}