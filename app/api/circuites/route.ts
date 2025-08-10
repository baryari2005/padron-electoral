import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { formatApiMessage } from "@/lib/utils/formatters";
import { handleError } from "@/lib/utils/request-helpers";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const all = searchParams.get("all") === "true"; // ← Agregado
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const terms = search.trim().split(/\s+/).filter(Boolean);

    let where: Prisma.CircuitoWhereInput = { deletedAt: null };

    if (terms.length > 0) {
      where = {
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

    // Si viene `all=true`, devolvemos todo sin paginar
    if (all) {
      const items = await db.circuito.findMany({
        where,
        orderBy: { nombre: "asc" },
      });

      return NextResponse.json({ items, total: items.length });
    }

    // Paginado normal
    const [items, total] = await Promise.all([
      db.circuito.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre: "asc" },
      }),
      db.circuito.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  }
  catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, codigo } = await req.json();
    const userId = getUserIdFromRequest(req);

    if (!nombre) return NextResponse.json({ error: formatApiMessage("required.name") }, { status: 400 });
    if (!codigo) return NextResponse.json({ error: formatApiMessage("required.code") }, { status: 400 });

    const circuito = await db.circuito.create({
      data: { nombre, codigo, userId },
    });

    return NextResponse.json(circuito, { status: 201 });
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