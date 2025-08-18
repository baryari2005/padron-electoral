export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { handleError } from "@/lib/utils/request-helpers";
import { formatApiMessage } from "@/lib/utils/formatters";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";
import { getPagination } from "@/lib/_server/pagination";
import { buildOrderBy, create, existItem, findByNameInsensitive, findByNumber, resurrect, SearchWhere } from "@/lib/_server/political-group.service";
import { mergeAndWhere } from "@/lib/_server/helper.service";

// GET: listar agrupaciones con paginación + búsqueda
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPagination(searchParams, 1, 10, 100);

    const search = searchParams.get("search") || "";
    const all = searchParams.get("all") === "true";

    const sortBy = searchParams.get("sortBy"); // "nombre" | "codigo" | undefined
    const sortDir = (searchParams.get("sortDir") === "desc" ? "desc" : "asc") as "asc" | "desc";
    const orderBy = buildOrderBy(sortBy, sortDir);

    let where: Prisma.AgrupacionPoliticaWhereInput = { deletedAt: null };
    where = mergeAndWhere(where, SearchWhere(search));

    if (all) {
      const items = await db.agrupacionPolitica.findMany({
        where,
        orderBy,
      });
      return NextResponse.json({ items, total: items.length });
    }

    const [items, total] = await Promise.all([
      db.agrupacionPolitica.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      db.agrupacionPolitica.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    return handleError(error);
  }
}

// POST: crear agrupación política
export async function POST(req: NextRequest) {
  try {
    const { nombre, numero, profileImage, color_hex, cargoIds } = await req.json();
    const userId = getUserIdFromRequest(req);

    if (!nombre) return NextResponse.json({ error: formatApiMessage("required.name") }, { status: 400 });
    if (!numero) return NextResponse.json({ error: formatApiMessage("required.number") }, { status: 400 });

    const numeroInt =
      typeof numero === "string" ? parseInt(numero, 10) : numero;

    if (!Number.isFinite(numeroInt)) {
      return NextResponse.json(
        { error: "El número de agrupación es inválido." },
        { status: 400 }
      );
    }

    const finalProfileImage =
      profileImage?.trim() ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        nombre
      )}&background=adf5d7&color=000&size=128&rounded=true&bold=true`;

    const existing = (await existItem(nombre, numero));

    if (!existing) {
      const created = await create({
        nombre, numero, profileImage: finalProfileImage, color_hex, userId, cargoIds
      });
      return NextResponse.json(created, { status: 201 });
    }

    if (existing?.deletedAt) {
      const resurrected = await resurrect(existing.id, userId);
      return NextResponse.json(resurrected, { status: 200 });
    }

    return NextResponse.json(
      { error: formatApiMessage("errors.politicalGroupExists") },
      { status: 400 }
    );
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: formatApiMessage("errors.politicalGroupExists") }, { status: 400 });
    }

    return handleError(error);
  }
}
