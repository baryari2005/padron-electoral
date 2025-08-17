import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { formatApiMessage } from "../utils/formatters";

export function buildCargoPoliticoWhere(search: string): Prisma.CargoPoliticoWhereInput {
  const terms = search.trim().split(/\s+/).filter(Boolean);
  const where: Prisma.CargoPoliticoWhereInput = { deletedAt: null };
  if (terms.length) {
    where.OR = terms.map((term) => ({
      nombre: { contains: term, mode: Prisma.QueryMode.insensitive },
    }));
  }
  return where;
}

export async function findByNombreInsensitive(nombre: string) {
  return db.cargoPolitico.findFirst({
    where: { nombre: { equals: nombre, mode: Prisma.QueryMode.insensitive } },
    select: { id: true, deletedAt: true },
  });
}

export async function getCargoPoliticoById(id: number) {
  return db.cargoPolitico.findFirst({ where: { id } });
}

export async function updateCargoPolitico(
  id: number,
  nombre: string,
  orden: number,
  userId?: string
) {
  const data: Prisma.CargoPoliticoUpdateInput = { nombre, orden, userId };

  return db.cargoPolitico.update({ where: { id }, data });
}

export async function softDeleteCargoPolitico(id: number, userId?: string) {
  const data: Prisma.CargoPoliticoUpdateInput = { deletedAt: { set: new Date() } };
  if (userId) data.userId = userId;
  return db.cargoPolitico.update({ where: { id }, data });
}

export async function createCargoPolitico(input: {
  nombre: string;
  orden?: number;
  userId: string;            // ⬅️ requerido
}) {
  const { nombre, orden, userId } = input;

  if (!userId || typeof userId !== "string") {
    throw new Error(formatApiMessage("errors.userNotAuthenticated"));
  }

  return db.cargoPolitico.create({
    data: {
      nombre,
      ...(typeof orden === "number" ? { orden } : {}),
      userId,
    },
  });
}

export async function resurrectCargoPolitico(
  id: number,
  opts: { orden?: number; userId?: string | null }
) {
  const { orden, userId } = opts ?? {};

  const data: Prisma.CargoPoliticoUpdateInput = {
    // si tu campo es nullable, esto vale; si tu TS protesta, podés usar la variante { set: null }
    deletedAt: null,
  };

  if (typeof orden === "number") {
    data.orden = orden;
  }

  // 👇 no mandes null: sólo seteá si tenés un string
  if (typeof userId === "string" && userId.length > 0) {
    data.userId = userId;
  }

  return db.cargoPolitico.update({
    where: { id },
    data,
  });
}

export async function fetchCargosOrder(): Promise<string[]> {
  const cargos = await db.cargoPolitico.findMany({
    where: { deletedAt: null },
    select: { nombre: true, orden: true },
    orderBy: [{ orden: "asc" }, { id: "asc" }],
  });
  // normalizá casing si tus datos vienen mixtos
  return cargos.map(c => c.nombre.toUpperCase());
}
