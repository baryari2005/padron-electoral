import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      mesa,
      totales,
      votosEspeciales,
      resultadosPresidenciales,
    } = body;

    if (!mesa?.numeroMesa || !mesa?.escuelaId || !mesa?.circuitoId) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios en 'mesa'" },
        { status: 400 }
      );
    }

    const mesaNumero = Number(mesa.numeroMesa);
    const establecimientoId = Number(mesa.escuelaId);
    const circuitoId = Number(mesa.circuitoId);

    if (isNaN(mesaNumero) || isNaN(establecimientoId) || isNaN(circuitoId)) {
      return NextResponse.json(
        { error: "Los valores de mesa deben ser numéricos válidos." },
        { status: 400 }
      );
    }

    // Chequear si ya existe una mesa con ese número y establecimiento
    const existing = await db.mesa.findFirst({
      where: {
        numero: mesaNumero.toString(),
        establecimientoId,
        circuitoId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una mesa con ese número para ese establecimiento y circuito." },
        { status: 400 }
      );
    }

    const created = await db.$transaction(async (tx) => {
      // Crear mesa
      const nuevaMesa = await tx.mesa.create({
        data: {
          numero: mesaNumero.toString(),
          establecimientoId,
          circuitoId,
        },
      });

      const mesaId = nuevaMesa.id;

      // Insertar totales
      await tx.totalMesa.create({
        data: {
          mesaId,
          sobresEnUrna: totales.sobres,
          electoresVotaron: totales.votantes,
          diferencia: totales.diferencia,
        },
      });

      // Insertar votos especiales
      const votosEspecialesData = Object.entries(votosEspeciales).map(
        ([categoriaIdStr, valores]: [string, any]) => ({
          mesaId,
          categoriaId: parseInt(categoriaIdStr),
          votosNulos: valores.nulos,
          votosRecurridos: valores.recurridos,
          votosImpugnados: valores.impugnados,
          votosComandoElectoral: valores.comandoElectoral,
          votosEnBlanco: valores.blancos,
        })
      );

      await tx.votosEspeciales.createMany({
        data: votosEspecialesData,
      });

      // Insertar resultados presidenciales
      const resultadosData = [];

      for (const agrupacion of resultadosPresidenciales) {
        const agrupacionId = agrupacion.id;

        for (const key of Object.keys(agrupacion)) {
          if (!isNaN(Number(key))) {
            resultadosData.push({
              mesaId,
              categoriaId: Number(key),
              agrupacionId: agrupacionId,
              votos: agrupacion[key],
            });
          }
        }
      }

      if (resultadosData.length > 0) {
        await tx.resultado.createMany({
          data: resultadosData,
        });
      }

      // Calcular y guardar diferencias por categoría
      const sobresEnUrna = totales.sobres;
      const categoriaIds = Object.keys(votosEspeciales); // string[] de categoríaId

      const diferenciasData = categoriaIds.map((categoriaIdStr) => {
        const categoriaId = Number(categoriaIdStr);

        const especiales = votosEspeciales[categoriaIdStr];
        const totalEspeciales =
          especiales.nulos +
          especiales.recurridos +
          especiales.impugnados +
          especiales.comandoElectoral +
          especiales.blancos;

        const totalAgrupaciones = resultadosPresidenciales.reduce((acc: number, agrupacion: any) => {
          const votos = agrupacion[categoriaIdStr];
          return acc + (typeof votos === "number" ? votos : 0);
        }, 0);

        const suma = totalEspeciales + totalAgrupaciones;
        const diferencia = sobresEnUrna - suma;

        return {
          mesaId,
          categoriaId,
          diferencia,
        };
      });

      await tx.diferenciaCategoria.createMany({
        data: diferenciasData,
      });
      return mesaId;
    });

    return NextResponse.json({ success: true, mesaId: created });
  } catch (error: any) {
    console.error("❌ Error al guardar certificado:", error);
    return NextResponse.json(
      { error: "Error al guardar el certificado." },
      { status: 500 }
    );
  }
}
