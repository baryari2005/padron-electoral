export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
// app/api/electoral-rolls/votes/batch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";

type Change = { electorId: string | number; voted: boolean };

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    const body = (await req.json()) as { mesaId?: string | number | null; changes?: Change[] };
    const { mesaId, changes } = body ?? {};

    if (!Array.isArray(changes) || changes.length === 0) {
      return NextResponse.json(
        { error: "Se requiere 'changes' como arreglo de { electorId, voted }" },
        { status: 400 }
      );
    }

    // IDs normalizados
    const toVoteIds = changes
      .filter(c => c?.voted === true)
      .map(c => Number(c.electorId))
      .filter(id => Number.isFinite(id));

    const toUnvoteIds = changes
      .filter(c => c?.voted === false)
      .map(c => Number(c.electorId))
      .filter(id => Number.isFinite(id));

    // Guard por mesa: TRADUCIR mesaId (PK) -> numeroMesa (+ establecimientoId)
    let mesaGuard: { numeroMesa?: number; establecimientoId?: number } = {};
    if (mesaId != null && mesaId !== "") {
      const mesa = await db.mesasPorEstablecimiento.findUnique({
        where: { id: Number(mesaId) },
        select: { numero: true, establecimientoId: true },
      });
      if (!mesa) {
        return NextResponse.json({ error: "Mesa no encontrada" }, { status: 400 });
      }
      mesaGuard = { numeroMesa: Number(mesa.numero), establecimientoId: Number(mesa.establecimientoId) };
      console.log("[mesaGuard]", mesaGuard);
    }

    // Verificación previa: qué IDs realmente matchean el guard
    const [eligibleVote, eligibleUnvote] = await Promise.all([
      toVoteIds.length
        ? db.padronElectoral.findMany({
          where: { id: { in: toVoteIds }, ...mesaGuard },
          select: { id: true },
        })
        : Promise.resolve([]),
      toUnvoteIds.length
        ? db.padronElectoral.findMany({
          where: { id: { in: toUnvoteIds }, ...mesaGuard },
          select: { id: true },
        })
        : Promise.resolve([]),
    ]);
    const eligVoteIds = new Set(eligibleVote.map(x => x.id));
    const eligUnvoteIds = new Set(eligibleUnvote.map(x => x.id));

    console.log("[toVoteIds]", toVoteIds, "-> eligible:", Array.from(eligVoteIds));
    console.log("[toUnvoteIds]", toUnvoteIds, "-> eligible:", Array.from(eligUnvoteIds));
    console.log("[mesaGuard]", mesaGuard);
    const now = new Date();
    const tx = [];

    if (eligVoteIds.size) {
      tx.push(
        db.padronElectoral.updateMany({
          where: { id: { in: Array.from(eligVoteIds) }, ...mesaGuard },
          data: { votoSiNo: "S", votedAt: now, votedBy: userId },
        })
      );
    }

    if (eligUnvoteIds.size) {
      tx.push(
        db.padronElectoral.updateMany({
          where: { id: { in: Array.from(eligUnvoteIds) }, ...mesaGuard },
          data: { votoSiNo: "N", votedAt: now, votedBy: userId },
        })
      );
    }

    if (tx.length === 0) {
      return NextResponse.json({
        success: true,
        votedCount: 0,
        unvotedCount: 0,
        updatedVotedIds: [],
        updatedUnvotedIds: [],
        skippedIds: {
          voted: toVoteIds.filter(id => !eligVoteIds.has(id)),
          unvoted: toUnvoteIds.filter(id => !eligUnvoteIds.has(id)),
        },
        note: "No hubo filas que cumplan el filtro (revisá numeroMesa/establecimientoId).",
      });
    }

    const results = await db.$transaction(tx);

    const votedCount =
      eligVoteIds.size ? (results[0]?.count ?? 0) : 0;
    const unvotedCount =
      eligUnvoteIds.size
        ? (eligVoteIds.size ? results[1]?.count ?? 0 : results[0]?.count ?? 0)
        : 0;

    return NextResponse.json({
      success: true,
      totalChanges: changes.length,
      votedCount,
      unvotedCount,
      updatedVotedIds: Array.from(eligVoteIds),
      updatedUnvotedIds: Array.from(eligUnvoteIds),
      appliedAt: now.toISOString(),
      skippedIds: {
        voted: toVoteIds.filter(id => !eligVoteIds.has(id)),
        unvoted: toUnvoteIds.filter(id => !eligUnvoteIds.has(id)),
      },
    });
  } catch (error) {
    console.error("Error en batch votes:", error);
    return NextResponse.json({ error: "Error interno al registrar votos" }, { status: 500 });
  }
}

