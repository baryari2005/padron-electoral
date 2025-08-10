import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { electoralRollSchema } from "@/app/(dashboard)/electoral-rolls/lib";
import { getAuthOrThrow } from "@/utils/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  let userId: string;

  try {
    const auth = getAuthOrThrow(req);
    userId = auth.userId;
  } catch (err) {
    return new NextResponse((err as Response).statusText, { status: (err as Response).status });
  }

  const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

  const elector = await db.padronElectoral.findFirst({
    where: { id }
  });

  if (!elector) {
    return NextResponse.json({ error: "Elector no encontrado" }, { status: 404 });
  }

  return NextResponse.json(elector);
}
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const data = electoralRollSchema.parse(body);

    const updated = await db.padronElectoral.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Error al actualizar el registro" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await db.padronElectoral.delete({ where: { id } });

    return NextResponse.json({ message: "Registro eliminado" });
  } catch (error: any) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Error al eliminar el registro" },
      { status: 500 }
    );
  }
}
