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
import { buildOrderBy, create, existItem, resurrect, SearchWhere } from "@/lib/_server/political-group.service";
import { mergeAndWhere } from "@/lib/_server/helper.service";
import { withActiveElection } from "@/lib/_server/withActiveElection";



export const GET = withActiveElection(async (req, { election }) => {
  try {
    const { searchParams } = new URL(req.url);  
    const search = searchParams.get("search") || "";
    const all = searchParams.get("all") === "true";

    const { page, limit, skip } = getPagination(searchParams, 1, 10, 100);

    const sortBy = searchParams.get("sortBy"); // "nombre" | "codigo" | undefined
    const sortDir = (searchParams.get("sortDir") === "desc" ? "desc" : "asc") as "asc" | "desc";
    const orderBy = buildOrderBy(sortBy, sortDir);

    let where: Prisma.AgrupacionPoliticaWhereInput = { eleccionId: election.id, deletedAt: null };
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

    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    return handleError(error);
  }
});

// POST: crear agrupación política
export const POST = withActiveElection(async (req, { election }) => {
  try {
    const { nombre, numero, profileImage, color_hex, orden, cargoIds } = await req.json();
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
      )}&background=adf5d7&color=000&size=128&rounded=true&bold=true&format=png`;

    const existing = (await existItem(nombre, numero, election.id));

    if (!existing) {
      const created = await create({
        nombre, numero, profileImage: finalProfileImage, color_hex, orden, userId, cargoIds, eleccionId: election.id
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
});
