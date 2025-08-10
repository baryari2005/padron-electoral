export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { dni: string } }
) {
  const url = new URL(req.url);
  const mesaId = url.searchParams.get("mesaId");

  if (!mesaId) {
    return NextResponse.json({ error: "mesaId requerido" }, { status: 400 });
  }

  const dni = params.dni.trim();
  if (!dni) {
    return NextResponse.json({ error: "DNI requerido" }, { status: 400 });
  }

  const elector = await db.padronElectoral.findFirst({
    where: { numeroMesa: Number(mesaId), numeroMatricula: dni },
    select: {
      id: true, numeroMatricula: true, apellido: true, nombre: true,
      numeroMesa: true, votedAt: true, votedBy: true
    },
  });

  if (!elector) {
    return NextResponse.json({ error: "No encontrado en esta mesa" }, { status: 404 });
  }

  return NextResponse.json(elector);
}
