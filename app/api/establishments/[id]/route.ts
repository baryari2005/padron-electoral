import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthOrThrow } from "@/utils/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  let userId: string;

  try {
    const auth = getAuthOrThrow(req);
    userId = auth.userId;
  } catch (err) {
    return new NextResponse((err as Response).statusText, { status: (err as Response).status });
  }

  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const establishment = await db.establecimiento.findFirst({
    where: { id }
  });

  if (!establishment) {
    return NextResponse.json({ error: "Establecimiento no encontrado" }, { status: 404 });
  }

  return NextResponse.json(establishment);
}

// Actualizar un establecimiento por ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  let loggedUserId: string;

  try {
    const auth = getAuthOrThrow(req);
    loggedUserId = auth.userId;

  } catch (err) {
    return new NextResponse((err as Response).statusText, { status: (err as Response).status });
  }

  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const body = await req.json();
  const { nombre, direccion, profileImage, circuitoId } = body;

  if (!nombre || !direccion || !profileImage || !circuitoId) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  try {
    const updated = await db.establecimiento.update({
      where: { id },
      data: {
        nombre,
        direccion,
        profileImage,
        userId: loggedUserId,
        circuitoId: circuitoId
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH Error]", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

// Eliminar un establecimiento por ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let userId: string;

  try {
    const auth = getAuthOrThrow(req);
    userId = auth.userId;
    console.log("✅ USER ID:", userId);
  } catch (err) {
    return new NextResponse((err as Response).statusText, { status: (err as Response).status });
  }

  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await db.establecimiento.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Establecimiento eliminado" });
  } catch (error) {
    console.error("[DELETE Error]", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
