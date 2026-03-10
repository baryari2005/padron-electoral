import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import SpreadsheetEditClient from '../../app/(dashboard)/spreadsheet/[id]/spreadsheet-edit-client';

/**
 * Permite buscar planillas aunque "nombre" sea null en la DB.
 * - Si escriben "planilla" o "mesa" (solo palabras), no filtramos por eso.
 * - Si escriben "planilla 13" / "mesa 13", extraemos el número y filtramos por numero.
 * - Si escriben "13" filtramos por numero contains "13"
 */
export function buildPlanillaWhere(search: string): Prisma.PlanillaWhereInput {
  const q = (search ?? "").trim();
  if (!q) return {};

  // tokens tipo: "planilla 13" -> ["planilla","13"]
  const tokens = q.split(/\s+/).filter(Boolean);

  // ignoramos palabras comunes para que "planilla" no “rompa”
  const stop = new Set(["planilla", "mesa"]);
  const cleaned = tokens.filter((t) => !stop.has(t.toLowerCase()));

  // si solo escribió "planilla" / "mesa", no filtramos (muestra todo)
  if (cleaned.length === 0) return {};

  // AND de OR: cada token debe aparecer en numero o nombre
  return {
    AND: cleaned.map((t) => ({
      OR: [
        { numero: { contains: t, mode: "insensitive" } },
        { nombre: { contains: t, mode: "insensitive" } },
      ],
    })),
  };
}

export function buildOrderBy(
  sortBy?: string | null,
  sortDir: "asc" | "desc" = "asc"
): Prisma.PlanillaOrderByWithRelationInput {
  const allowed = new Set(["numero", "createdAt", "updatedAt", "id"]);
  const key = sortBy && allowed.has(sortBy) ? sortBy : "numero";
  return { [key]: sortDir } as Prisma.PlanillaOrderByWithRelationInput;
}

export async function getSpreadsheetById(id: number, eleccionId: number) {
  return db.planilla.findFirst({
    where:
    {
      id,
      eleccionId,
    }
  })
}

export async function findByNumberInsensitive(numero: string, eleccionId: number) {
  return db.planilla.findFirst({
    where: {
      eleccionId,
      numero: { equals: numero, mode: Prisma.QueryMode.insensitive },
    },
  });
}

export async function findByNameInsensitive(nombre: string, eleccionId: number) {
  return db.planilla.findFirst({
    where: {
      eleccionId,
      nombre: { equals: nombre, mode: Prisma.QueryMode.insensitive }
    },
    select: { id: true },
  });
}

export async function findByNumberOrNameInsensitive(
  numero: number,
  nombre: string,
  eleccionId: number
) {
  return db.planilla.findFirst({
    where: {
      eleccionId,
      OR: [
        {
          numero: String(numero)
        },
        {
          nombre: {
            equals: nombre,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
    },
    select: {
      id: true,
      numero: true,
      nombre: true,
    },
  });
}

export async function createSpreadsheet(input: { numero: string; nombre?: string; eleccionId: number }) {
  return db.planilla.create({
    data: {
      ...input
    }
  });
}

export async function updateSpreadsheet(data: {
  id: number,
  nombre: string,
  numero: string,  
  eleccionId: number,
}) {
  const id = data.id;
  const eleccionId = data.eleccionId;

  return db.planilla.update({ where: { id, eleccionId }, data: { ...data } });
}

export async function deleteSpreadsheet(id: number,  eleccionId: number) {    
    return db.planilla.delete({ where: { id,  eleccionId }});
}