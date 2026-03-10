import { Prisma } from "@prisma/client";

export function buildOrderBy(
  sortBy?: string | null,
  sortDir: "asc" | "desc" = "asc"
): Prisma.EleccionOrderByWithRelationInput {
  switch (sortBy) {
    case "nombre":
      return { nombre: sortDir };
    default:
      return { nombre: "asc" }; // orden por defecto
  }
}