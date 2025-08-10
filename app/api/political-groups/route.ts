import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { handleError } from "@/lib/utils/request-helpers";
import { formatApiMessage } from "@/lib/utils/formatters";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";

// GET: listar agrupaciones con paginación + búsqueda
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const terms = search.trim().split(/\s+/).filter(Boolean);

    let where: Prisma.AgrupacionPoliticaWhereInput = { deletedAt: null };

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
      db.agrupacionPolitica.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre: "asc" },
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
    const { nombre, numero, profileImage } = await req.json();
    const userId = getUserIdFromRequest(req);

    if (!nombre) return NextResponse.json({ error: formatApiMessage("required.name") }, { status: 400 });
    if (!numero) return NextResponse.json({ error: formatApiMessage("required.number") }, { status: 400 });

    const finalProfileImage =
      profileImage?.trim() ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=adf5d7&color=000&size=128&rounded=true&bold=true`;

    const created = await db.agrupacionPolitica.create({
      data: {
        nombre,
        numero,
        profileImage: finalProfileImage,
        userId,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: formatApiMessage("errors.politicalGroupExists") }, { status: 400 });
    }

    return handleError(error);
  }
}