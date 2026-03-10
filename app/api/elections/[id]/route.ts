import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/getUserIdFromRequest";


export async function GET(
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

  return NextResponse.json(election);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthUser(req);

  if (user.role?.toUpperCase() !== "ADMINISTRADOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = Number(params.id);
  const body = await req.json();
  const { nombre, tipo, fecha } = body;

  const election = await prisma.eleccion.findUnique({
    where: { id },
  });

  if (!election) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (election.estado !== "DRAFT") {
    return NextResponse.json(
      { error: "Cannot edit active or closed election" },
      { status: 400 }
    );
  }

  const updated = await prisma.eleccion.update({
    where: { id },
    data: {
      nombre,
      tipo,
      fecha: fecha ? new Date(fecha) : null,
    },
  });

  return NextResponse.json(updated);
}