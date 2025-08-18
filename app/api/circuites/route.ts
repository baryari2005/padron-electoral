export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { formatApiMessage } from "@/lib/utils/formatters";
import { handleError } from "@/lib/utils/request-helpers";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";
import {
  buildCircuitoWhere,
  buildOrderBy,
  createCircuito,
  findByNombreInsensitive,
  resurrectCircuito,
} from "@/lib/_server/circuites.service";
import { getPagination } from "@/lib/_server/pagination";
import { mergeAndWhere } from "@/lib/_server/helper.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPagination(searchParams, 1, 10, 100);

    const search = searchParams.get("search") || "";
    const all = searchParams.get("all") === "true";

    // Sorting opcional (si no viene sortBy, queda el default)
    const sortBy = searchParams.get("sortBy"); // "nombre" | "codigo" | undefined
    const sortDir = (searchParams.get("sortDir") === "desc" ? "desc" : "asc") as "asc" | "desc";
    const orderBy = buildOrderBy(sortBy, sortDir);

    let where: Prisma.CircuitoWhereInput = { deletedAt: null };
    where = mergeAndWhere(where, buildCircuitoWhere(search));    

    // all=true → sin paginar (igualmente respeta orderBy para consistencia)
    if (all) {
      const items = await db.circuito.findMany({
        where,
        orderBy,
      });
      return NextResponse.json({ items, total: items.length });
    }

    // Paginado normal
    const [items, total] = await Promise.all([
      db.circuito.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      db.circuito.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, codigo } = await req.json();
    const userId = getUserIdFromRequest(req);

    if (!nombre) {
      return NextResponse.json({ error: formatApiMessage("required.name") }, { status: 400 });
    }
    if (!codigo) {
      return NextResponse.json({ error: formatApiMessage("required.code") }, { status: 400 });
    }

    const existing = await findByNombreInsensitive(nombre);

    if (!existing) {
      const created = await createCircuito({ nombre, codigo, userId });
      return NextResponse.json(created, { status: 201 });
    }

    if (existing.deletedAt) {
      const resurrected = await resurrectCircuito(existing.id, userId);
      return NextResponse.json(resurrected, { status: 200 });
    }

    return NextResponse.json(
      { error: formatApiMessage("errors.circuiteExists") },
      { status: 400 }
    );
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: formatApiMessage("errors.circuiteExists") },
        { status: 400 }
      );
    }
    return handleError(error);
  }
}
