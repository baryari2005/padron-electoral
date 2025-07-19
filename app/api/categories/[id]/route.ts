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

  const categories = await db.categoria.findFirst({
    where: { id }
  });

  if (!categories) {
    return NextResponse.json({ error: "Categoria no encontrada" }, { status: 404 });
  }

  return NextResponse.json(categories);
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
  const { nombre } = body;

  if (!nombre ) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  try {
    const updated = await db.categoria.update({
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
    await db.categoria.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Categoria eliminada" });
  } catch (error) {
    console.error("[DELETE Error]", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}