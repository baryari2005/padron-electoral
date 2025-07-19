import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getAuthOrThrow } from "@/utils/auth";

// Obtener todos los establecimientos
export async function GET() {
  const establishments = await db.establecimiento.findMany({    
   include: {
      circuito: true, // ✅ incluye toda la relación
    },
  });

  console.log("[ESTABLECIMIENTOS GET]", JSON.stringify(establishments, null, 2));
  return NextResponse.json({ establishments });
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