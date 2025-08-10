export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

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

    const formatted = mesas.map((mesa) => ({
      mesaId: mesa.id,
      numero: mesa.numero,
      establecimientoId: mesa.establecimiento.id,
      establecimiento: mesa.establecimiento.nombre,
      circuito: mesa.establecimiento.circuito.nombre,
      resultados: mesa.resultadosAgrupaciones.map((r) => ({
        categoria: r.cargoPolitico.nombre,
        agrupacion: r.agrupacionPolitica.nombre,
        logo: r.agrupacionPolitica.profileImage,
        votos: r.votos,
      })),
      votosEspeciales: mesa.resultadosEspeciales.flatMap((e) => [
        { categoria: e.cargoPolitico.nombre, tipo: "Nulo", cantidad: e.votosNulos },
        { categoria: e.cargoPolitico.nombre, tipo: "En blanco", cantidad: e.votosEnBlanco },
        { categoria: e.cargoPolitico.nombre, tipo: "Recurrido", cantidad: e.votosRecurridos },
        { categoria: e.cargoPolitico.nombre, tipo: "Impugnado", cantidad: e.votosImpugnados },
        { categoria: e.cargoPolitico.nombre, tipo: "Comando", cantidad: e.votosComandoElectoral },
      ]),
      resumen: mesa.resultadoFinal
        ? {
            sobresEnUrna: mesa.resultadoFinal.sobresEnUrna,
            electoresVotaron: mesa.resultadoFinal.electoresVotaron,
            diferencia: mesa.resultadoFinal.diferencia,
          }
        : null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[GET /reports/mesa-vote-summary]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

