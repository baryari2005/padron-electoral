import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withActiveElection } from "@/lib/_server/withActiveElection";

export const GET = withActiveElection(async (req, { election }) => {
  const { searchParams } = new URL(req.url);

  const establecimientoId = Number(searchParams.get("establecimientoId"));
  const numeroMesa = Number(searchParams.get("numeroMesa"));

  if (!establecimientoId || !numeroMesa) {
    return NextResponse.json(
      { error: "Parámetros inválidos" },
      { status: 400 }
    );
  }

  // 🔥 Primero buscamos la mesa por unique compuesto
  const mesa = await db.mesasPorEstablecimiento.findUnique({
    where: {
      numero_establecimientoId_eleccionId: {
        numero: numeroMesa,
        establecimientoId,
        eleccionId: election.id,
      },
    },
    include: {
      stats: true,
    },
  });

  return NextResponse.json({
    padronTotal: mesa?.stats?.padronTotal ?? 0,
  });
});