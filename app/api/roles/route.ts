import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma, Role } from '@prisma/client';

// Obtener todos los roles
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const terms = search.trim().split(" ").filter(Boolean);

  let where: Prisma.RoleWhereInput | undefined = undefined;

  if (terms.length > 0) {
    where = {
      OR: terms.map((term) => ({
        name: { contains: term, mode: Prisma.QueryMode.insensitive },
      })),
    };
  }

  const [roles, total] = await Promise.all([
    db.role.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
    }),
    db.role.count({ where }),
  ]);

  console.log("Roles:", roles);
  console.log("Total:", total);

  return NextResponse.json({ items: roles, total });
}

// Crear un nuevo rol
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    const role = await db.role.create({
      data: { name },
    });

    return NextResponse.json({ role }, { status: 201 });
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