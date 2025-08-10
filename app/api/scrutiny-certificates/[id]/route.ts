import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const mesaId = Number(params.id);

    const mesa = await db.mesaEscrutada.findUnique({
      where: { id: mesaId },
      include: {
        resultadoFinal: true,
        resultadosAgrupaciones: {
          include: {
            agrupacionPolitica: true,
            cargoPolitico: true,
          },
        },
        resultadosEspeciales: {
          include: { cargoPolitico: true },
        },
        establecimiento: { include: { circuito: true } },
        firmas: {
          include: {
            cargoPolitico: true,
            agrupacionPolitica: true,
          },
        },
      },
    });

    if (!mesa) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });
    }

    // 🗳️ Agrupaciones
    const resultadosMap = new Map<string, number>();
    mesa.resultadosAgrupaciones.forEach((r) => {
      const key = `${r.agrupacionPolitica.numero}-${r.categoriaId}`;
      resultadosMap.set(key, r.votos);
    });

    const agrupacionesUnicas = Array.from(
      new Map(
        mesa.resultadosAgrupaciones.map((r) => [
          r.agrupacionPolitica.numero,
          r.agrupacionPolitica,
        ])
      ).values()
    ).sort((a, b) => a.nombre.localeCompare(b.nombre));

    const categoriasUnicas = Array.from(
      new Map(
        mesa.resultadosAgrupaciones.map((r) => [
          r.categoriaId,
          r.cargoPolitico,
        ])
      ).values()
    );

    const resultadosPresidenciales = agrupacionesUnicas.map((agr) => {
      const base: any = {
        id: agr.id,
        nombre: agr.nombre,
        numero: agr.numero,
        profileImage: agr.profileImage ?? "",
      };

      categoriasUnicas.forEach((cat) => {
        const key = `${agr.numero}-${cat.id}`;
        base[String(cat.id)] = resultadosMap.get(key) ?? 0;
      });

      return base;
    });

    // 🧾 Firmas
    // const firmas = mesa.firmas.map((f) => ({
    //   id: f.id,
    //   cargoId: f.cargoId,
    //   nombre: f.nombre,
    //   dni: f.dni,
    //   agrupacionId: f.agrupacionId,
    // }));

    const certificadoFormData = {
      mesa: {
        numeroMesa: String(mesa.numero),
        escuelaId: String(mesa.establecimientoId),
        circuitoId: String(mesa.establecimiento.circuitoId),
        establecimientoNombre: mesa.establecimiento.nombre,
        circuitoNombre: mesa.establecimiento.circuito.nombre,
        circuitoCodigo: mesa.establecimiento.circuito.codigo,
      },
      totales: {
        sobres: mesa.resultadoFinal?.sobresEnUrna ?? 0,
        votantes: mesa.resultadoFinal?.electoresVotaron ?? 0,
        diferencia: mesa.resultadoFinal?.diferencia ?? 0,
      },
      votosEspeciales: mesa.resultadosEspeciales.reduce((acc, voto) => {
        const catId = String(voto.categoriaId);
        acc[catId] = {
          nulos: voto.votosNulos,
          blancos: voto.votosEnBlanco,
          recurridos: voto.votosRecurridos,
          impugnados: voto.votosImpugnados,
          comandoElectoral: voto.votosComandoElectoral,
        };
        return acc;
      }, {} as any),
      resultadosPresidenciales,
      // firmas, // ✅ ahora lo incluís
    };

    return NextResponse.json(certificadoFormData);
  } catch (error) {
    console.error("Error al obtener certificado:", error);
    return NextResponse.json({ error: "Error al obtener certificado" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const mesaId = Number(params.id);
    if (isNaN(mesaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();

    // 🔁 Borrar registros previos
    await Promise.all([
      db.resultadoVotosEspeciales.deleteMany({ where: { mesaId } }),
      db.resultadoPorAgrupacionPolitica.deleteMany({ where: { mesaId } }),
      db.resultadoPorMesa.deleteMany({ where: { mesaId } }),
      db.diferenciasPorCargosPoliticos.deleteMany({ where: { mesaId } }),
      db.firma.deleteMany({ where: { mesaId } }), // ← si estás editando firmas también
    ]);

    const {
      mesa,
      totales,
      votosEspeciales,
      resultadosPresidenciales,
      // firmas (opcional),
    } = body;

    const updated = await db.$transaction(async (tx) => {
      await tx.resultadoPorMesa.create({
        data: {
          mesaId,
          sobresEnUrna: totales.sobres,
          electoresVotaron: totales.votantes,
          diferencia: totales.diferencia,
        },
      });

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

      if (votosEspecialesData.length > 0) {
        await tx.resultadoVotosEspeciales.createMany({ data: votosEspecialesData });
      }

      const resultadosData = [];
      for (const agrupacion of resultadosPresidenciales) {
        const agrupacionId = agrupacion.id;
        for (const key of Object.keys(agrupacion)) {
          if (!isNaN(Number(key))) {
            resultadosData.push({
              mesaId,
              categoriaId: Number(key),
              agrupacionId,
              votos: agrupacion[key],
            });
          }
        }
      }

      if (resultadosData.length > 0) {
        await tx.resultadoPorAgrupacionPolitica.createMany({ data: resultadosData });
      }

      // Calcular diferencias por categoría
      const sobresEnUrna = totales.sobres;
      const categoriaIds = Object.keys(votosEspeciales);

      const diferenciasData = categoriaIds.map((categoriaIdStr) => {
        const categoriaId = Number(categoriaIdStr);
        const especiales = votosEspeciales[categoriaIdStr];

        const totalEspeciales =
          especiales.nulos +
          especiales.recurridos +
          especiales.impugnados +
          especiales.comandoElectoral +
          especiales.blancos;

        const totalAgrupaciones = resultadosPresidenciales.reduce(
          (acc: number, agrupacion: any) => {
            const votos = agrupacion[categoriaIdStr];
            return acc + (typeof votos === "number" ? votos : 0);
          },
          0
        );

        const suma = totalEspeciales + totalAgrupaciones;
        const diferencia = sobresEnUrna - suma;

        return {
          mesaId,
          categoriaId,
          diferencia,
        };
      });

      if (diferenciasData.length > 0) {
        await tx.diferenciasPorCargosPoliticos.createMany({ data: diferenciasData });
      }

      return mesaId;
    });

    // Forzar timestamp updatedAt
    await db.mesaEscrutada.update({
      where: { id: mesaId },
      data: {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error al actualizar certificado:", error);
    return NextResponse.json({ error: "Error al actualizar certificado" }, { status: 500 });
  }
}
