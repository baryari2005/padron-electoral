import { Prisma } from "@prisma/client";
import { formatApiMessage } from "../utils/formatters";
import { db } from "../db";


export function SearchWhere(search: string): Prisma.AgrupacionPoliticaWhereInput {
  const terms = search.trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return {};

  return {
    AND: [
      {
        OR: terms.map((term) => ({
          nombre: { contains: term, mode: Prisma.QueryMode.insensitive },
        })),
      },
      {
        nombre: { contains: search, mode: Prisma.QueryMode.insensitive },
      },
    ],
  };
}

export function buildOrderBy(
  sortBy?: string | null,
  sortDir: "asc" | "desc" = "asc"
): Prisma.AgrupacionPoliticaOrderByWithRelationInput {
  switch (sortBy) {
    case "nombre":
      return { nombre: sortDir };
    case "numero":
      return { numero: sortDir };
    // podés agregar más campos acá
    default:
      return { nombre: "asc" }; // orden por defecto
  }
}

export async function findByNameInsensitive(nombre: string) {
  return db.agrupacionPolitica.findFirst({
    where: { nombre: { equals: nombre, mode: Prisma.QueryMode.insensitive } },
    select: { id: true, deletedAt: true },
  });
}

export async function findByNumber(numero: number) {
  return db.agrupacionPolitica.findFirst({
    where: { numero },
    select: { id: true, deletedAt: true },
  });
}

export async function existItem(nombre: string, numero: number) {
  return await db.agrupacionPolitica.findFirst({
    where: {
      OR: [
        { nombre: { equals: nombre, mode: "insensitive" } },
        { numero },
      ],
    },
  });
}

export async function getById(id: number) {
  return db.agrupacionPolitica.findUnique({
    where: { id },
    include: {
      AgrupacionCargoPerm: {
        where: { eleccionId: null, allowed: true }, // permisos globales
        select: { cargoId: true },
      },
    },
  });
}

export async function update(id: number, input: {
  nombre: string;
  numero: number;
  profileImage?: string;
  color_hex: string;
  userId?: string;
  cargoIds?: number[]; // 👈 puede venir undefined
}) {
  const agrupacionId = Number(id);
  if (!agrupacionId) throw new Error("ID inválido");

  // 👇 sacamos cargoIds y ponemos default seguro
  const { cargoIds = [], ...data } = input;

  const result = await db.$transaction(async (tx) => {
    // 1) actualizar datos básicos
    const g = await tx.agrupacionPolitica.update({
      where: { id: agrupacionId },
      data,
    });

    // 2) reemplazar permisos GLOBALes (eleccionId: null)
    await tx.agrupacionCargoPerm.deleteMany({
      where: { agrupacionId, eleccionId: null },
    });

    if (Array.isArray(cargoIds) && cargoIds.length > 0) {
      await tx.agrupacionCargoPerm.createMany({
        data: cargoIds.map((cargoId) => ({
          agrupacionId,
          cargoId,
          eleccionId: null,
          allowed: true,
        })),
      });
    }

    return g;
  });

  return result;
}

export async function softDelete(id: number, userId?: string) {
  const agrupacionId = Number(id);
  if (!agrupacionId) throw new Error("ID inválido");

  const data: Prisma.AgrupacionPoliticaUpdateInput = {
    deletedAt: new Date(),
    ...(userId ? { userId } : {}),
  };

  // Idempotente + atómico
  const updated = await db.$transaction(async (tx) => {
    const existing = await tx.agrupacionPolitica.findUnique({
      where: { id: agrupacionId },
      select: { deletedAt: true },
    });
    if (!existing) throw new Error("Agrupación no encontrada");

    // (opcional) si ya está borrada, devolvemos tal cual
    if (existing.deletedAt) {
      return tx.agrupacionPolitica.findUnique({ where: { id: agrupacionId } });
    }

    // Si querés borrar TODOS los permisos, sacá eleccionId:null
    await tx.agrupacionCargoPerm.deleteMany({
      where: { agrupacionId }, // ← elimina globales y por elección
      // si SOLO querés globales: where: { agrupacionId, eleccionId: null }
    });

    return tx.agrupacionPolitica.update({
      where: { id: agrupacionId },
      data,
    });
  });

  return updated;
}

export async function create(input: {
  nombre: string;
  numero: number;
  profileImage?: string;
  color_hex: string;
  userId: string;
  cargoIds: number[];
}) {
  const { userId } = input;

  if (!userId || typeof userId !== "string") {
    throw new Error(formatApiMessage("errors.userNotAuthenticated"));
  }

  // ❌ No podemos pasar cargoIds al create de agrupacion
  const { cargoIds, ...data } = input;

  const group = await db.$transaction(async (tx) => {
    // 1) Crear la agrupación sin cargoIds
    const g = await tx.agrupacionPolitica.create({
      data, // nombre, numero, color_hex, profileImage?, userId
    });

    // 2) Crear permisos globales (eleccionId = null)
    if (cargoIds?.length) {
      await tx.agrupacionCargoPerm.createMany({
        data: cargoIds.map((cargoId) => ({
          agrupacionId: g.id,
          cargoId,
          eleccionId: null,
          allowed: true,
        })),
        skipDuplicates: true,
      });
    }

    return g;
  });

  return group;
}


export async function resurrect(
  id: number, userId?: string
) {

  if (!userId || typeof userId !== "string") {
    throw new Error(formatApiMessage("errors.userNotAuthenticated"));
  }

  const data: Prisma.AgrupacionPoliticaUpdateInput = {
    userId: userId,
    deletedAt: null,
  };

  return db.agrupacionPolitica.update({
    where: { id },
    data,
  });
}
