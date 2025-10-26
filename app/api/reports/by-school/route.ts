export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const mesas = await db.mesaEscrutada.findMany({
      where: { deletedAt: null },
      include: {
        establecimiento: true,
        resultadosAgrupaciones: {
          include: {
            cargoPolitico: true,
            agrupacionPolitica: true,
          },
        },
        resultadosEspeciales: {
          include: {
            cargoPolitico: true,
          },
        },
      },
    });

    const resumenPorEscuela: Record<
      number,
      {
        establecimientoId: number;
        establecimientoNombre: string;
        resultados: Record<string, Record<string, { votos: number; logo?: string | null }>>;
        votosEspeciales: Record<string, {
          votosNulos: number;
          votosEnBlanco: number;
          votosRecurridos: number;
          votosImpugnados: number;
          // votosComandoElectoral: number;
        }>;
      }
    > = {};

    for (const mesa of mesas) {
      const { establecimientoId, establecimiento } = mesa;

      if (!resumenPorEscuela[establecimientoId]) {
        resumenPorEscuela[establecimientoId] = {
          establecimientoId,
          establecimientoNombre: establecimiento.nombre,
          resultados: {},
          votosEspeciales: {},
        };
      }

      // 🔢 Votos por agrupación política
      for (const r of mesa.resultadosAgrupaciones) {
        const categoria = r.cargoPolitico.nombre;
        const agrupacion = r.agrupacionPolitica.nombre;

        if (!resumenPorEscuela[establecimientoId].resultados[categoria]) {
          resumenPorEscuela[establecimientoId].resultados[categoria] = {};
        }

        if (!resumenPorEscuela[establecimientoId].resultados[categoria][agrupacion]) {
          resumenPorEscuela[establecimientoId].resultados[categoria][agrupacion] = {
            votos: 0,
            logo: r.agrupacionPolitica.profileImage,
          };
        }

        resumenPorEscuela[establecimientoId].resultados[categoria][agrupacion].votos += r.votos;
      }

      // 🧾 Votos especiales
      for (const ve of mesa.resultadosEspeciales) {
        const categoria = ve.cargoPolitico.nombre;

        if (!resumenPorEscuela[establecimientoId].votosEspeciales[categoria]) {
          resumenPorEscuela[establecimientoId].votosEspeciales[categoria] = {
            votosNulos: 0,
            votosEnBlanco: 0,
            votosRecurridos: 0,
            votosImpugnados: 0,
            // votosComandoElectoral: 0,
          };
        }

        resumenPorEscuela[establecimientoId].votosEspeciales[categoria].votosNulos += ve.votosNulos;
        resumenPorEscuela[establecimientoId].votosEspeciales[categoria].votosEnBlanco += ve.votosEnBlanco;
        resumenPorEscuela[establecimientoId].votosEspeciales[categoria].votosRecurridos += ve.votosRecurridos;
        resumenPorEscuela[establecimientoId].votosEspeciales[categoria].votosImpugnados += ve.votosImpugnados;
        // resumenPorEscuela[establecimientoId].votosEspeciales[categoria].votosComandoElectoral += ve.votosComandoElectoral;
      }
    }

    // 🔁 Convertir a array para frontend
    const resumenFinal = Object.values(resumenPorEscuela).map((escuela) => ({
      establecimientoId: escuela.establecimientoId,
      establecimientoNombre: escuela.establecimientoNombre,

      resultados: Object.entries(escuela.resultados).flatMap(([categoria, agrupaciones]) =>
        Object.entries(agrupaciones).map(([agrupacion, { votos, logo }]) => ({
          categoria,
          agrupacion,
          votos,
          logo,
        }))
      ),

      votosEspeciales: Object.entries(escuela.votosEspeciales).map(([categoria, valores]) => ({
        categoria,
        ...valores,
      })),
    }));

    return NextResponse.json({ resumen: resumenFinal });
  } catch (error) {
    console.error("❌ Error al generar resumen por escuela:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

