export const runtime = 'nodejs';       // no Edge
export const dynamic = 'force-dynamic';// desactiva static render
export const revalidate = 0; 

import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

// Si preferís, usa un prisma singleton:
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const establecimientoId = searchParams.get("establecimientoId");
    const mesaId = searchParams.get("mesaId");
    const qRaw = (searchParams.get("q") || "").trim();
    const top = Number(searchParams.get("top") || 20);

    // ----- WHERE base (filtros) -----
    const whereBase: any = {
      ...(establecimientoId ? { establecimientoId: Number(establecimientoId) } : {}),
      ...(mesaId ? { mesaId: Number(mesaId) } : {}),
    };

    if (qRaw) {
      const isNumeric = /^\d+$/.test(qRaw);
      whereBase.OR = [
        { apellido: { contains: qRaw, mode: "insensitive" } },
        { nombre: { contains: qRaw, mode: "insensitive" } },
        // Ajustá según tu tipo de DNI (string o number)
        ...(isNumeric
          ? [{ dni: Number(qRaw) } as any]
          : [{ dni: { contains: qRaw } as any }]),
      ];
    }

    // ----- Totales -----
    const [total, votaron] = await Promise.all([
      prisma.padronElectoral.count({ where: whereBase }),
      prisma.padronElectoral.count({ where: { ...whereBase, votoSiNo: "S" as any } }),
    ]);
    const noVotaron = total - votaron;
    const participacion = total > 0 ? Math.round((votaron / total) * 10000) / 100 : 0;

    // ----- Agrupado por Establecimiento (top N por no votaron) -----
    const byEstTotal = await prisma.padronElectoral.groupBy({
      by: ["establecimientoId"],
      _count: { _all: true },
      where: whereBase,
    });
    const byEstVotaron = await prisma.padronElectoral.groupBy({
      by: ["establecimientoId"],
      _count: { _all: true },
      where: { ...whereBase, votoSiNo: "S" as any },
    });

    const estMap = new Map<number, { total: number; votaron: number }>();
    byEstTotal.forEach((r) =>
      estMap.set(Number(r.establecimientoId), { total: r._count._all, votaron: 0 })
    );
    byEstVotaron.forEach((r) => {
      const k = Number(r.establecimientoId);
      const cur = estMap.get(k) || { total: 0, votaron: 0 };
      cur.votaron = r._count._all;
      estMap.set(k, cur);
    });

    const estInfo = estMap.size
      ? await prisma.establecimiento.findMany({
          where: { id: { in: Array.from(estMap.keys()) } },
          select: { id: true, nombre: true },
        })
      : [];
    const nameByEst = new Map(estInfo.map((e) => [e.id, e.nombre]));

    let porEstablecimiento = Array.from(estMap.entries()).map(([id, v]) => ({
      id,
      nombre: nameByEst.get(id) ?? `Est. ${id}`,
      total: v.total,
      votaron: v.votaron,
      noVotaron: v.total - v.votaron,
      participacion: v.total > 0 ? (v.votaron / v.total) * 100 : 0,
    }));
    porEstablecimiento.sort((a, b) => b.noVotaron - a.noVotaron);
    porEstablecimiento = porEstablecimiento.slice(0, Math.max(0, top));

    // ----- Agrupado por Mesa (solo si hay datos) -----
    const byMesaTotal = await prisma.padronElectoral.groupBy({
      by: ["numeroMesa"],
      _count: { _all: true },
      where: whereBase,
    });

    let porMesa:
      | Array<{
          id: number;
          numero: number | string;
          total: number;
          votaron: number;
          noVotaron: number;
          participacion: number;
        }>
      | [] = [];

    // if (byMesaTotal.length) {
    //   const byMesaVotaron = await prisma.padronElectoral.groupBy({
    //     by: ["mesaId"],
    //     _count: { _all: true },
    //     where: { ...whereBase, votoSiNo: "S" as any },
    //   });

    //   const mesaMap = new Map<number, { total: number; votaron: number }>();
    //   byMesaTotal.forEach((r) =>
    //     mesaMap.set(Number(r.numeroMesa), { total: r._count._all, votaron: 0 })
    //   );
    //   byMesaVotaron.forEach((r) => {
    //     const k = Number(r.numeroMesa);
    //     const cur = mesaMap.get(k) || { total: 0, votaron: 0 };
    //     cur.votaron = r._count._all;
    //     mesaMap.set(k, cur);
    //   });

    //   const mesaInfo = await prisma.mesaStats.findMany({
    //     where: { id: { in: Array.from(mesaMap.keys()) } },
    //     select: { id: true, numero: true },
    //   });
    //   const numByMesa = new Map(mesaInfo.map((m) => [m.id, m.numero]));

    //   porMesa = Array.from(mesaMap.entries())
    //     .map(([id, v]) => ({
    //       id,
    //       numero: numByMesa.get(id) ?? id,
    //       total: v.total,
    //       votaron: v.votaron,
    //       noVotaron: v.total - v.votaron,
    //       participacion: v.total > 0 ? (v.votaron / v.total) * 100 : 0,
    //     }))
    //     .sort((a, b) => Number(a.numero) - Number(b.numero));
    // }

    return new Response(
      JSON.stringify({
        totals: { total, votaron, noVotaron, participacion },
        porEstablecimiento,
        porMesa,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: "No se pudieron obtener estadísticas" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
