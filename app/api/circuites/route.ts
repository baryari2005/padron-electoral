import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Obtener todos los circuites
export async function GET() {
  const circuites = await db.circuito.findMany({
    select: { id: true, nombre: true, codigo: true },
  });
  return NextResponse.json({ circuites });
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