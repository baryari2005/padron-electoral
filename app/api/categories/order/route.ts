import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const cargos = await db.cargoPolitico.findMany({
    where: { deletedAt: null },
    select: { nombre: true, orden: true },
    orderBy: [{ orden: "asc" }, { id: "asc" }],
  });
  return NextResponse.json(cargos.map(c => c.nombre.toUpperCase()));
}