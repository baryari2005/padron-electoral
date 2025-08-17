export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { handleError } from "@/lib/utils/request-helpers";
import { formatApiMessage } from "@/lib/utils/formatters";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";

import { db } from "@/lib/db";
import { getPagination } from "@/lib/_server/pagination";
import { buildCargoPoliticoWhere, createCargoPolitico, findByNombreInsensitive, resurrectCargoPolitico } from "@/lib/_server/categories.service";

function buildOrderBy(
  sortBy?: string | null,
  sortDir: "asc" | "desc" = "asc"
): Prisma.CargoPoliticoOrderByWithRelationInput {
  switch (sortBy) {
    case "nombre":
      return { nombre: sortDir };
    default:
      return { orden: "asc" }; // orden por defecto
  }
}

/* GET */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const all = searchParams.get("all") === "true"; // ← Agregado

    const { page, limit, skip } = getPagination(searchParams, 1, 10, 100);

    // Sorting opcional (si no viene sortBy, queda el default)
    const sortBy = searchParams.get("sortBy"); // "nombre" | "codigo" | undefined
    const sortDir = (searchParams.get("sortDir") === "desc" ? "desc" : "asc") as "asc" | "desc";
    const orderBy = buildOrderBy(sortBy, sortDir);

    const where = buildCargoPoliticoWhere(search);

    if (all) {
      const items = await db.cargoPolitico.findMany({
        where,
        orderBy,
      });
      return NextResponse.json({ items, total: items.length });
    }

    const [items, total] = await Promise.all([
      db.cargoPolitico.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      db.cargoPolitico.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    return handleError(error);
  }
}

/* POST: crear o “resucitar” si estaba soft-deleted */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = getUserIdFromRequest(req);

    const nombre = (body?.nombre ?? "").trim();
    const orden = typeof body?.orden === "number" && Number.isFinite(body.orden) ? body.orden : undefined;

    if (!nombre) return NextResponse.json({ error: formatApiMessage("required.name") }, { status: 400 });

    const existing = await findByNombreInsensitive(nombre);

    if (!existing) {
      const created = await createCargoPolitico({ nombre, orden, userId });
      return NextResponse.json(created, { status: 201 });
    }

    if (existing.deletedAt) {
      const resurrected = await resurrectCargoPolitico(existing.id, { orden, userId });
      return NextResponse.json(resurrected, { status: 200 });
    }

    return NextResponse.json({ error: formatApiMessage("errors.categoryExists") }, { status: 400 });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: formatApiMessage("errors.categoryExists") }, { status: 400 });
    }
    return handleError(error);
  }
}
