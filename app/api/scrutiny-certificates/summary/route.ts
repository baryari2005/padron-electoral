import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const escuelas = await db.establecimiento.findMany({
      where: {
        mesa: {
          some: {}, // trae solo las que tienen al menos una mesa
        },
      },
      include: {
        circuito: true,
        mesa: {
          select: {
            id: true,
            numero: true,
            createdAt: true,
            totalMesa: {
              select: {
                sobresEnUrna: true,
                electoresVotaron: true,
                diferencia: true,
              },
            },
            diferenciaCategoria: {
              where: {
                diferencia: { not: 0 }
              },
              include: {
                categoria: true,
              }
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

    // Convertimos Mesa (mayúscula) a mesa (minúscula)
    const response = escuelas.map((e) => ({
      ...e,
      mesa: e.mesa.map((m) => ({
        ...m,
        diferenciasPorCategoria: m.diferenciaCategoria, // 👈 este rename es clave
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
