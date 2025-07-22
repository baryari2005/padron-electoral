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

  let where: Prisma.CircuitoWhereInput | undefined = undefined;

  if (terms.length > 0) {
    where = {
      OR: terms.map((term) => ({
        nombre: { contains: term, mode: Prisma.QueryMode.insensitive },
      })),
    };
  }

  const [circuitos, total] = await Promise.all([
    db.circuito.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nombre: "asc" },
    }),
    db.circuito.count({ where }),
  ]);

  console.log("Circuitos:", circuitos);
  console.log("Total:", total);

  return NextResponse.json({ items: circuitos, total });
}

// Crear un nuevo rol
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, codigo } = body;

    if (!codigo) {
      return NextResponse.json({ error: "Código requerido" }, { status: 400 });
    }
    if (!nombre) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    const circuit = await db.circuito.create({
      data: { codigo, nombre },
    });

    return NextResponse.json({ circuit }, { status: 201 });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ya existe un circuito con ese nombre." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}