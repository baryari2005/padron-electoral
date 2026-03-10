export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withActiveElection } from "@/lib/_server/withActiveElection";

export const GET = withActiveElection(async (req, { election }) => {
  try {
    const { searchParams } = new URL(req.url);
    const establecimientoIdParam = searchParams.get("establecimientoId");

    if (!establecimientoIdParam) {
      return NextResponse.json(
        { error: "establecimientoId es requerido" },
        { status: 400 }
      );
    }

    const establecimientoId = Number(establecimientoIdParam);

    if (isNaN(establecimientoId)) {
      return NextResponse.json(
        { error: "establecimientoId inválido" },
        { status: 400 }
      );
    }

    const mesas = await db.mesasPorEstablecimiento.findMany({
      where: {
        establecimientoId,
        eleccionId: election.id,
        deletedAt: null,
      },
      select: {
        numero: true,
      },
      orderBy: {
        numero: "asc",
      },
    });

    return NextResponse.json({
      items: mesas.map((m) => m.numero),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener las mesas" },
      { status: 500 }
    );
  }
});