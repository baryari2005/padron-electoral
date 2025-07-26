import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const mesaId = Number(params.id);

    const mesa = await db.mesa.findUnique({
      where: { id: mesaId },
      include: {
        totalMesa: true,
        resultados: {
          include: {
            agrupacion: true,
            categoria: true,
          },
        },
        votosEspeciales: {
          include: { categoria: true },
        },
        establecimiento: { include: { circuito: true } },
      },
    });

    if (!mesa) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });
    }

    // 🔁 Generamos un mapa para resultados [agrupacion.numero + categoria.id] => votos
    const resultadosMap = new Map<string, number>();
    mesa.resultados.forEach((r) => {
      const key = `${r.agrupacion.numero}-${r.categoriaId}`;
      resultadosMap.set(key, r.votos);
    });

    // 🔁 Agrupamos por agrupaciones únicas
    const agrupacionesUnicas = Array.from(
      new Map(
        mesa.resultados.map((r) => [r.agrupacion.numero, r.agrupacion])
      ).values()
    );

    agrupacionesUnicas.sort((a, b) => a.nombre.localeCompare(b.nombre));

    const categoriasUnicas = Array.from(
      new Map(
        mesa.resultados.map((r) => [r.categoriaId, r.categoria])
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

    const certificadoFormData = {
      mesa: {
        numeroMesa: mesa.numero,
        escuelaId: String(mesa.establecimientoId),
        circuitoId: String(mesa.establecimiento.circuitoId),
      },
      totales: {
        sobres: mesa.totalMesa?.sobresEnUrna ?? 0,
        votantes: mesa.totalMesa?.electoresVotaron ?? 0,
        diferencia: mesa.totalMesa?.diferencia ?? 0,
      },
      votosEspeciales: mesa.votosEspeciales.reduce((acc, voto) => {
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
    const body = await req.json();

    await db.votosEspeciales.deleteMany({ where: { mesaId } });
    await db.resultado.deleteMany({ where: { mesaId } });
    await db.totalMesa.deleteMany({ where: { mesaId } });
    await db.diferenciaCategoria.deleteMany({ where: { mesaId } });

    const {
      mesa,
      totales,
      votosEspeciales,
      resultadosPresidenciales
    } = body;

    console.log("[BODY]", body);

    const updated = await db.$transaction(async (tx) => {
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

    // 6. Actualizar mesa para que se modifique el updatedAt
    await db.mesa.update({
      where: { id: mesaId },
      data: {}, // solo fuerza el update para cambiar updatedAt
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar certificado:", error);
    return NextResponse.json({ error: "Error al actualizar certificado" }, { status: 500 });
  }
}
