import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Obtener todos los categories
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const terms = search.trim().split(" ").filter(Boolean);

  let where: Prisma.CategoriaWhereInput | undefined = undefined;

  if (terms.length > 0) {
    where = {
      OR: terms.map((term) => ({
        nombre: { contains: term, mode: Prisma.QueryMode.insensitive },
      })),
    };
  }

  const [categorias, total] = await Promise.all([
    db.categoria.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nombre: "asc" },
    }),
    db.categoria.count({ where }),
  ]);

  // console.log("Categorias:", categorias);
  // console.log("Total:", total);

  return NextResponse.json({ items: categorias, total });
}

// Crear un nuevo rol
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre } = body;

    if (!nombre) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    const category = await db.categoria.create({
      data: { nombre },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ya existe un rol con ese nombre." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}