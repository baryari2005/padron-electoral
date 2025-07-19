import { db } from "@/lib/db";
import { getAuthOrThrow } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

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

  const circuites = await db.circuito.findFirst({
    where: { id }
  });

  if (!circuites) {
    return NextResponse.json({ error: "Circuito no encontrado" }, { status: 404 });
  }

  return NextResponse.json(circuites);
}

// Actualizar un establecimiento por ID
export async function PUT(req: NextRequest, { params }: { params: { id: number } }) {
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

  const body = await req.json();
  const { nombre } = body;

  if (!nombre ) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }

  try {
    const updated = await db.circuito.update({
      where: { id },
      data: { nombre },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH Error]", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

  try {
    await db.circuito.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Circuito eliminado" });
  } catch (error) {
    console.error("[DELETE Error]", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}