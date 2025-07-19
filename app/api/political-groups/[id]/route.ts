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

  const politicalGroups = await db.agrupacionPolitica.findFirst({
    where: { id }
  });

  if (!politicalGroups) {
    return NextResponse.json({ error: "agrupacionPolitica no encontrada" }, { status: 404 });
  }

  return NextResponse.json(politicalGroups);
}

// Actualizar un establecimiento por ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
  const { nombre, numero, profileImage } = body;

  if (!nombre ) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  try {
    const updated = await db.agrupacionPolitica.update({
      where: { id },
      data: { nombre, profileImage, numero },
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
    await db.agrupacionPolitica.delete({
      where: { id }
    });

    return NextResponse.json({ message: "agrupacionPolitica eliminada" });
  } catch (error) {
    console.error("[DELETE Error]", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}