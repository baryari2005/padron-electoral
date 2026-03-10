import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/getUserIdFromRequest";
import { Prisma } from "@prisma/client";
import { getPagination } from "@/lib/_server/pagination";
import { buildOrderBy } from "@/lib/_server/elections.service";
import { db } from "@/lib/db";
import { handleError } from "@/lib/utils/request-helpers";


function SearchWhere(search: string): Prisma.EleccionWhereInput {
  if (!search) return {};

  return {
    OR: [
      {
        nombre: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        tipo: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        estado: {
          contains: search,
          mode: "insensitive",
        },
      },
    ],
  };
}

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (user.role?.toUpperCase() !== "ADMINISTRADOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPagination(searchParams, 1, 10, 100);

    const search = searchParams.get("search") || "";
    const all = searchParams.get("all") === "true";

    const sortBy = searchParams.get("sortBy");
    const sortDir = (searchParams.get("sortDir") === "desc" ? "desc" : "asc") as
      | "asc"
      | "desc";

    const orderBy = buildOrderBy(sortBy, sortDir);

    const where: Prisma.EleccionWhereInput = search
      ? SearchWhere(search)
      : {};

    if (all) {
      const items = await db.eleccion.findMany({
        where,
        orderBy,
      });

      return NextResponse.json({ items, total: items.length });
    }
    
    const [items, total] = await Promise.all([
      db.eleccion.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      db.eleccion.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);

  if (user.role !== "ADMINISTRADOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { nombre, tipo, fecha } = body;

  if (!nombre || !tipo) {
    return NextResponse.json(
      { error: "nombre and tipo are required" },
      { status: 400 }
    );
  }

  const election = await prisma.eleccion.create({
    data: {
      nombre,
      tipo,
      fecha: fecha ? new Date(fecha) : null,
      estado: "DRAFT",
      activa: false,
    },
  });

  return NextResponse.json(election, { status: 201 });
}