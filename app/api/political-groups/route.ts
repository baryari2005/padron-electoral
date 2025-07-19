import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Obtener todos los politicalGroups
export async function GET() {
  const politicalGroups = await db.agrupacionPolitica.findMany({
    select: {
      id: true,
      nombre: true,
      numero: true,
      profileImage: true
    },
  });
  return NextResponse.json({ politicalGroups });
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