import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthOrThrow } from "@/utils/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthOrThrow(req);

  if (user.role !== "ADMINISTRADOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = Number(params.id);

  await prisma.eleccion.update({
    where: { id },
    data: {
      activa: false,
      estado: "CLOSED",
    },
  });

  return NextResponse.json({ success: true });
}