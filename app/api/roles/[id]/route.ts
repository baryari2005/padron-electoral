import { db } from "@/lib/db";
import { getAuthOrThrow } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  let userId: string;

console.log("Entre")

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

  const roles = await db.role.findFirst({
    where: { id }
  });

  if (!roles) {
    return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
  }

  return NextResponse.json(roles);
}

// Actualizar un establecimiento por ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

  const body = await req.json();
  const { name } = body;

  if (!name ) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  try {
    const updated = await db.role.update({
      where: { id },
      data: { name },
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
        console.log("✅ USER ID:", userId); 
  } catch (err) {
    return new NextResponse((err as Response).statusText, { status: (err as Response).status });
  }
  
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await db.role.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Rol eliminado" });
  } catch (error) {
    console.error("[DELETE Error]", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}