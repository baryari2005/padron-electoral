import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { formatApiMessage } from "../utils/formatters";

export function buildCircuitoWhere(search: string): Prisma.CircuitoWhereInput {
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
): Prisma.CircuitoOrderByWithRelationInput {
    switch (sortBy) {
        case "nombre":
            return { nombre: sortDir };
        case "codigo":
            return { codigo: sortDir };
        // podés agregar más campos acá
        default:
            return { nombre: "asc" }; // orden por defecto
    }
}

export async function findByNombreInsensitive(nombre: string) {
    return db.circuito.findFirst({
        where: { nombre: { equals: nombre, mode: Prisma.QueryMode.insensitive } },
        select: { id: true, deletedAt: true },
    });
}

export async function getCircuitoById(id: number) {
    return db.circuito.findFirst({ where: { id } });
}

export async function updateCircuito(data: {
    id: number,
    nombre: string,
    codigo: string,
    userId?: string
}) {
    const id = data.id;
    return db.circuito.update({ where: { id }, data: { ...data } });
}

export async function softDeleteCircuito(id: number, userId?: string) {
    const data: Prisma.CircuitoUpdateInput = { deletedAt: { set: new Date() } };
    if (userId) data.userId = userId;
    return db.circuito.update({ where: { id }, data });
}

export async function createCircuito(input: {
    nombre: string;
    codigo: string;
    userId: string;            // ⬅️ requerido
}) {
    const { userId } = input;

    if (!userId || typeof userId !== "string") {
        throw new Error(formatApiMessage("errors.userNotAuthenticated"));
    }

    return db.circuito.create({
        data: {
            ...input
        },
    });
}

export async function resurrectCircuito(
    id: number, userId?: string
) {

    if (!userId || typeof userId !== "string") {
        throw new Error(formatApiMessage("errors.userNotAuthenticated"));
    }

    const data: Prisma.CircuitoUpdateInput = {
        userId: userId,
        deletedAt: null,
    };

    return db.circuito.update({
        where: { id },
        data,
    });
}
