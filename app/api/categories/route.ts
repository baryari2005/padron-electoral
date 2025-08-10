export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils/request-helpers";
import { Prisma } from "@prisma/client";
import { formatApiMessage } from "@/lib/utils/formatters";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";

// GET: listado con paginación + búsqueda
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const terms = search.trim().split(/\s+/).filter(Boolean);

    let where: Prisma.CargoPoliticoWhereInput = { deletedAt: null };

    if (terms.length > 0) {
      where.OR = terms.map((term) => ({
        nombre: { contains: term, mode: Prisma.QueryMode.insensitive },
      }));
    }

    const [items, total] = await Promise.all([
      db.cargoPolitico.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre: "asc" },
      }),
      db.cargoPolitico.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    return handleError(error);
  }
}

// POST: crear nuevo cargo político
export async function POST(req: NextRequest) {
  try {
    const { nombre } = await req.json();
    const userId = getUserIdFromRequest(req);

    if (!nombre) {
      return NextResponse.json({ error: formatApiMessage("required.name") }, { status: 400 });
    }

    const category = await db.cargoPolitico.create({
      data: { nombre, userId },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: formatApiMessage("errors.categoryExists") },
        { status: 400 }
      );
    }

    return handleError(error);
  }
}

