import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/getUserIdFromRequest";


export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthUser(req);

  if (user.role?.toUpperCase() !== "ADMINISTRADOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = Number(params.id);

  const election = await prisma.eleccion.findUnique({
    where: { id },
  });

  if (!election) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (election.estado === "CLOSED") {
    return NextResponse.json(
      { error: "Cannot activate closed election" },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.eleccion.updateMany({
      data: { activa: false },
    }),
    prisma.eleccion.update({
      where: { id },
      data: {
        activa: true,
        estado: "ACTIVE",
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}

export async function POST( req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthUser(req)

  if (user.role !== "ADMINISTRADOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const id = Number(params.id)

  await prisma.$transaction([
    prisma.eleccion.updateMany({
      where: { activa: true },
      data: { activa: false },
    }),
    prisma.eleccion.update({
      where: { id },
      data: {
        activa: true,
        estado: "ACTIVE",
      },
    }),
  ])

  return NextResponse.json({ ok: true })
}