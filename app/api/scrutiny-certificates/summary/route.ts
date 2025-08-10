export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const escuelas = await db.establecimiento.findMany({
      where: {
        mesasEscrutadas: {
          some: {}, // solo las escuelas con al menos una mesa cargada
        },
      },
      include: {
        circuito: true,
        mesasEscrutadas: {
          select: {
            id: true,
            numero: true,
            createdAt: true,
            resultadoFinal: {
              select: {
                sobresEnUrna: true,
                electoresVotaron: true,
                diferencia: true,
              },
            },
            diferenciasCargos: {
              where: {
                diferencia: { not: 0 },
              },
              include: {
                cargoPolitico: true,
              },
            },
          },
          orderBy: {
            numero: "asc",
          },
        },
      },
      orderBy: {
        nombre: "asc",
      },
    });

    // 🔁 Transformación final para alinear los nombres con el frontend
    const response = escuelas.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      direccion: e.direccion,
      circuito: {
        nombre: e.circuito.nombre,
      },
      mesa: e.mesasEscrutadas.map((m) => ({
        id: m.id,
        numero: String(m.numero),
        createdAt: m.createdAt,
        totalMesa: m.resultadoFinal,
        diferenciasPorCategoria: m.diferenciasCargos.map((d) => ({
          categoriaId: d.categoriaId,
          diferencia: d.diferencia,
          categoria: {
            nombre: d.cargoPolitico.nombre,
          },
        })),
      })),
    }));

    return NextResponse.json({ items: response });
  } catch (error) {
    console.error("❌ Error al obtener resumen de certificados:", error);
    return NextResponse.json(
      { error: "Error al obtener los certificados" },
      { status: 500 }
    );
  }
}

