export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withActiveElection } from "@/lib/_server/withActiveElection";

export const GET = withActiveElection(async (_req, { election }) => {
  try {
    const escuelas = await db.establecimiento.findMany({
      where: {
        eleccionId: election.id, // 🔥 FILTRAMOS POR ELECCIÓN
        mesasEscrutadas: {
          some: {
            eleccionId: election.id, // 🔥 SEGURIDAD EXTRA
          },
        },
      },
      include: {
        circuito: true,
        mesasEscrutadas: {
          where: {
            eleccionId: election.id, // 🔥 SOLO MESAS DE ESTA ELECCIÓN
          },
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

    // 🔁 Transformación alineada con frontend
    const response = escuelas.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      direccion: e.direccion,

      circuitoId: e.circuitoId,
      circuito: {
        nombre: e.circuito?.nombre ?? "—",
      },
      
      mesa: e.mesasEscrutadas.map((m) => {
        const rf = m.resultadoFinal?.[0];
        return {
          id: m.id,
          numero: String(m.numero),
          createdAt: m.createdAt,
  
          // 🔥 ESTRUCTURA NORMALIZADA
          totalMesa: {
            sobresEnUrna: rf.sobresEnUrna ?? 0,
            electoresVotaron: rf.electoresVotaron ?? 0,
            diferencia: rf.diferencia ?? 0,
          },
  
          diferenciasPorCategoria: m.diferenciasCargos.map((d) => ({
            categoriaId: d.id, // 👈 ID real
            diferencia: d.diferencia,
            categoria: {
              nombre: d.cargoPolitico.nombre,
            },
          })),
        };
      }),
    }));

    return NextResponse.json({ items: response });
  } catch (error) {
    console.error("❌ Error al obtener resumen de certificados:", error);

    return NextResponse.json(
      { error: "Error al obtener los certificados" },
      { status: 500 }
    );
  }
});