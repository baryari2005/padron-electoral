import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getAuthOrThrow } from "@/utils/auth";

// Obtener todos los establecimientos
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const noPagination = searchParams.get("all") === "true";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const terms = search.trim().split(/\s+/).filter(Boolean);

  let where: Prisma.EstablecimientoWhereInput | undefined = undefined;

  if (terms.length > 0) {
    where = {
      AND: terms.map((term) => ({
        OR: [
          { nombre: { contains: term, mode: "insensitive" } },
          { direccion: { contains: term, mode: "insensitive" } },
          { circuito: { nombre: { contains: term, mode: "insensitive" } } },
        ],
      })),
    };
  }

  const queryOptions: Prisma.EstablecimientoFindManyArgs = {
    where,
    include: { circuito: true },
    orderBy: { nombre: "asc" },
  };

  if (!noPagination) {
    queryOptions.skip = skip;
    queryOptions.take = limit;
  }

  const [establecimientos, total] = await Promise.all([
    db.establecimiento.findMany(queryOptions),
    db.establecimiento.count({ where }),
  ]);

  // console.log("Establecimientos:", establecimientos);
  // console.log("Total:", total);

  return NextResponse.json({ items: establecimientos, total });
}

export async function POST(req: NextRequest) {
  const auth = getAuthOrThrow(req);
  const loggedUserId = auth.userId;

  try {
    const body = await req.json();
    const { nombre, direccion, profileImage, userId, circuitId } = body;

    const finalProfileImage =
      profileImage?.trim() ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=adf5d7&color=000&size=128&rounded=true&bold=true`;


    if (!nombre || !direccion || !circuitId) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const establishment = await db.establecimiento.create({
      data: {
        nombre,
        direccion,
        userId: loggedUserId,
        profileImage: finalProfileImage,
        circuitoId: circuitId
      },
    });

    return NextResponse.json({ establishment }, { status: 201 });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ya existe un establecimiento con ese nombre." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}