export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
// app/api/establishments/[id]/available-tables/route.ts
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils/request-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const establecimientoId = parseInt(params.id);

    if (isNaN(establecimientoId)) {
      return NextResponse.json(
        { error: "Invalid establishment ID" },
        { status: 400 }
      );
    }

    const mesas = await db.mesasPorEstablecimiento.findMany({
      where: {
        establecimientoId,
        deletedAt: null,
      },
      select: {
        id: true,
        numero: true,
        mesaEscrutada: {
          select: { id: true },
        },
      },
      orderBy: { numero: "asc" },
    });

    const mesasConEstado = mesas.map((m) => ({
      id: m.id,
      numero: m.numero,
      escrutada: m.mesaEscrutada !== null,
    }));

    return NextResponse.json({ items: mesasConEstado });
  } catch (error) {
    return handleError(error);
  }
}
