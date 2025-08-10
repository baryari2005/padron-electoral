export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from '@prisma/client';
import { formatApiMessage } from "@/lib/utils/formatters";
import { handleError } from "@/lib/utils/request-helpers";

// GET: listar roles con paginación + búsqueda
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const terms = search.trim().split(/\s+/).filter(Boolean);

    let where: Prisma.RolWhereInput | undefined = undefined;

    if (terms.length > 0) {
      where = {
        AND: [
          {
            OR: terms.map((term) => ({
              nombre: { contains: term, mode: Prisma.QueryMode.insensitive, },
            })),
          },
          {
            nombre: { contains: search, mode: Prisma.QueryMode.insensitive, },
          },
        ],
      };
    }

    const [items, total] = await Promise.all([
      db.rol.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre: "asc" },
      }),
      db.rol.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  }
  catch (error) {
    return handleError(error);
  }
}

// POST: crear roles
export async function POST(req: NextRequest) {
  try {
    const { nombre } = await req.json();

    if (!nombre) return NextResponse.json({ error: formatApiMessage("required.name") }, { status: 400 });

    const created = await db.rol.create({
      data: { nombre },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: formatApiMessage("errors.roleExists") }, { status: 400 });
    }

    return handleError(error);

  }
}
