import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cargos = await db.cargoPolitico.findMany({
      where: { deletedAt: null },
      select: { nombre: true, orden: true },
      orderBy: [
        { orden: "asc" },     // 2 antes que 200
        { nombre: "asc" },    // desempate
      ],
    });
    return NextResponse.json(cargos);
  } catch (e) {
    console.error(e);
    return new NextResponse("Error al obtener cargos", { status: 500 });
  }
}