export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { mapMesasToResumenTotal } from "./mapMesasToResumenTotal";

export async function GET() {
  try {
    const mesas = await db.mesaEscrutada.findMany({
      where: { deletedAt: null },
      include: {
        establecimiento: {
          include: {
            circuito: true,
          },
        },
        resultadosAgrupaciones: {
          include: {
            agrupacionPolitica: true,
            cargoPolitico: true,
          },
        },
        resultadosEspeciales: {
          include: {
            cargoPolitico: true,
          },
        },
        resultadoFinal: true,
      }      
    });

    const agrupado = mapMesasToResumenTotal(mesas);
    
    return NextResponse.json(agrupado);  

  } catch (error) {
    console.error("[GET /reports/total-vote-summary]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

