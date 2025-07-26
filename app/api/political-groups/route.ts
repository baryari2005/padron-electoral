import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const terms = search.trim().split(" ").filter(Boolean);

  let where: Prisma.AgrupacionPoliticaWhereInput | undefined = undefined;

  if (terms.length > 0) {
    where = {
      OR: terms.map((term) => ({
        nombre: { contains: term, mode: Prisma.QueryMode.insensitive },
      })),
    };
  }

  const [agrupaciones, total] = await Promise.all([
    db.agrupacionPolitica.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nombre: "asc" },
    }),
    db.agrupacionPolitica.count({ where }),
  ]);

  // console.log("Agrupaciones:", agrupaciones);
  // console.log("Total:", total);

  return NextResponse.json({ items: agrupaciones, total });
}

// Crear un nuevo rol
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, numero, profileImage } = body;

    if (!nombre || !numero) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const finalProfileImage =
      profileImage?.trim() ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=adf5d7&color=000&size=128&rounded=true&bold=true`;

    const politicalGroup = await db.agrupacionPolitica.create({
      data: {
        nombre,
        numero,
        profileImage: finalProfileImage
      },
    });

    return NextResponse.json({ politicalGroup }, { status: 201 });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ya existe una Agrupación Política con ese nombre." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}