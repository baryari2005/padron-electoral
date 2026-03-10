export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withActiveElection } from "@/lib/_server/withActiveElection";

export const GET = withActiveElection(
  async (
    req: NextRequest,
    context: { election: any; params?: Record<string, string> }
  ) => {
    try {
      const { election, params } = context;

      if (!params?.id) {
        return NextResponse.json(
          { error: "ID requerido" },
          { status: 400 }
        );
      }

      const mesaId = Number(params.id);

      if (isNaN(mesaId)) {
        return NextResponse.json(
          { error: "ID inválido" },
          { status: 400 }
        );
      }

      const mesa = await db.mesaEscrutada.findUnique({
        where: { id: mesaId, eleccionId: election.id },
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
      ).sort((a, b) => {
        const ao = a.orden ?? 999999; // fallback grande
        const bo = b.orden ?? 999999;
        if (ao !== bo) return ao - bo;
        return a.nombre.localeCompare(b.nombre, "es");
      });

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
          sobres: mesa.resultadoFinal?.[0].sobresEnUrna ?? 0,
          votantes: mesa.resultadoFinal?.[0].electoresVotaron ?? 0,
          diferencia: mesa.resultadoFinal?.[0].diferencia ?? 0,
        },
        votosEspeciales: mesa.resultadosEspeciales.reduce((acc, voto) => {
          const catId = String(voto.categoriaId);
          acc[catId] = {
            nulos: voto.votosNulos,
            blancos: voto.votosEnBlanco,
            recurridos: voto.votosRecurridos,
            impugnados: voto.votosImpugnados,
            // comandoElectoral: voto.votosComandoElectoral,
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
  });

export const PUT = withActiveElection(
  async (
    req: NextRequest,
    { election, params }: { election: any; params?: Record<string, string> }
  ) => {
    try {
      if (!params?.id) {
        return NextResponse.json({ error: "ID requerido" }, { status: 400 });
      }

      const mesaId = Number(params.id);
      if (isNaN(mesaId)) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
      }

      // 🔒 Verificamos que la mesa pertenezca a la elección activa
      const mesaExiste = await db.mesaEscrutada.findFirst({
        where: {
          id: mesaId,
          eleccionId: election.id,
        },
        select: { id: true },
      });

      if (!mesaExiste) {
        return NextResponse.json(
          { error: "Mesa no encontrada para esta elección" },
          { status: 404 }
        );
      }

      const body = await req.json();

      const { totales, votosEspeciales, resultadosPresidenciales } = body;

      await db.$transaction(async (tx) => {
        // 🔁 Borrar registros previos SOLO de esta elección
        await Promise.all([
          tx.resultadoVotosEspeciales.deleteMany({
            where: { eleccionId: election.id, mesaId },
          }),
          tx.resultadoPorAgrupacionPolitica.deleteMany({
            where: { eleccionId: election.id, mesaId },
          }),
          tx.resultadoPorMesa.deleteMany({
            where: { eleccionId: election.id, mesaId },
          }),
          tx.diferenciasPorCargosPoliticos.deleteMany({
            where: { eleccionId: election.id, mesaId },
          }),
          tx.firma.deleteMany({
            where: { mesaId },
          }),
        ]);

        // =========================
        // RESULTADO FINAL
        // =========================

        await tx.resultadoPorMesa.create({
          data: {
            mesaId,  
            eleccionId: election.id,          
            sobresEnUrna: Number(totales?.sobres ?? 0),
            electoresVotaron: Number(totales?.votantes ?? 0),
            diferencia: Number(totales?.diferencia ?? 0),
          },
        });

        // =========================
        // VOTOS ESPECIALES
        // =========================

        const votosEspecialesData = Object.entries(votosEspeciales ?? {})
          .map(([categoriaIdStr, valores]: [string, any]) => ({
            mesaId,            
            eleccionId: election.id,            
            categoriaId: Number(categoriaIdStr),
            votosNulos: Number(valores?.nulos ?? 0),
            votosRecurridos: Number(valores?.recurridos ?? 0),
            votosImpugnados: Number(valores?.impugnados ?? 0),
            votosComandoElectoral: 0,
            votosEnBlanco: Number(valores?.blancos ?? 0),
          }))
          .filter(
            (v) =>
              v.votosNulos ||
              v.votosRecurridos ||
              v.votosImpugnados ||
              v.votosEnBlanco
          );

        if (votosEspecialesData.length > 0) {
          await tx.resultadoVotosEspeciales.createMany({
            data: votosEspecialesData,
          });
        }

        // =========================
        // RESULTADOS POR AGRUPACIÓN
        // =========================

        const resultadosData: any[] = [];

        for (const agrupacion of resultadosPresidenciales ?? []) {
          const agrupacionId = agrupacion.id;

          for (const key of Object.keys(agrupacion)) {
            if (!isNaN(Number(key))) {
              resultadosData.push({
                eleccionId: election.id,
                mesaId,                
                categoriaId: Number(key),
                agrupacionId,
                votos: Number(agrupacion[key] ?? 0),
              });
            }
          }
        }

        if (resultadosData.length > 0) {
          await tx.resultadoPorAgrupacionPolitica.createMany({
            data: resultadosData,
          });
        }

        // =========================
        // DIFERENCIAS POR CATEGORÍA
        // =========================

        const sobresEnUrna = Number(totales?.sobres ?? 0);

        const categoriaIds = Object.keys(votosEspeciales ?? {});

        const diferenciasData = categoriaIds.map((categoriaIdStr) => {
          const categoriaId = Number(categoriaIdStr);
          const especiales = votosEspeciales[categoriaIdStr] ?? {};

          const totalEspeciales =
            Number(especiales?.nulos ?? 0) +
            Number(especiales?.recurridos ?? 0) +
            Number(especiales?.impugnados ?? 0) +
            Number(especiales?.blancos ?? 0);

          const totalAgrupaciones = (resultadosPresidenciales ?? []).reduce(
            (acc: number, agrupacion: any) => {
              const votos = agrupacion[categoriaIdStr];
              return acc + Number(votos ?? 0);
            },
            0
          );

          const suma = totalEspeciales + totalAgrupaciones;
          const diferencia = sobresEnUrna - suma;

          return {
            eleccionId: election.id,
            mesaId,            
            categoriaId,
            diferencia,
          };
        });

        if (diferenciasData.length > 0) {
          await tx.diferenciasPorCargosPoliticos.createMany({
            data: diferenciasData,
          });
        }
      });

      // 🔄 Forzar updatedAt
      await db.mesaEscrutada.update({
        where: { eleccionId: election.id, id: mesaId },
        data: {},
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("❌ Error al actualizar certificado:", error);
      return NextResponse.json(
        { error: "Error al actualizar certificado" },
        { status: 500 }
      );
    }
  }
);