export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { withActiveElection } from "@/lib/_server/withActiveElection";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";

type BatchChange = {
  electorId: string;
  voted: boolean;
};

type RequestBody = {
  mesaId?: string | number | null;
  changes?: BatchChange[];
};

export const POST = withActiveElection(async (req, { election }) => {
  try {
    const body = (await req.json()) as RequestBody;
    const mesaIdRaw = body?.mesaId;
    const changesRaw = Array.isArray(body?.changes) ? body.changes : [];
    const userId = getUserIdFromRequest(req);

    const mesaId =
      mesaIdRaw === null || mesaIdRaw === undefined || mesaIdRaw === ""
        ? undefined
        : Number(mesaIdRaw);

    if (mesaId !== undefined && Number.isNaN(mesaId)) {
      return NextResponse.json(
        { error: "mesaId no es válido" },
        { status: 400 }
      );
    }

    if (!changesRaw.length) {
      return NextResponse.json(
        { error: "No hay cambios para guardar" },
        { status: 400 }
      );
    }

    const normalizedChanges = changesRaw
      .map((item) => ({
        electorId: Number(item.electorId),
        voted: Boolean(item.voted),
      }))
      .filter(
        (item) => Number.isInteger(item.electorId) && item.electorId > 0
      );

    if (!normalizedChanges.length) {
      return NextResponse.json(
        { error: "Los cambios recibidos no son válidos" },
        { status: 400 }
      );
    }

    // Si llega el mismo elector más de una vez, nos quedamos con el último valor.
    const dedupMap = new Map<number, boolean>();

    for (const item of normalizedChanges) {
      dedupMap.set(item.electorId, item.voted);
    }

    const dedupedChanges = Array.from(dedupMap.entries()).map(
      ([electorId, voted]) => ({
        electorId,
        voted,
      })
    );

    let mesa:
      | {
          id: number;
          numero: number;
          establecimientoId: number;
          eleccionId: number;
        }
      | null = null;

    if (mesaId !== undefined) {
      mesa = await db.mesasPorEstablecimiento.findFirst({
        where: {
          id: mesaId,
          eleccionId: election.id,
          deletedAt: null,
        },
        select: {
          id: true,
          numero: true,
          establecimientoId: true,
          eleccionId: true,
        },
      });

      if (!mesa) {
        return NextResponse.json(
          {
            error:
              "La mesa seleccionada no existe o no pertenece a la elección activa",
          },
          { status: 404 }
        );
      }
    }

    const now = new Date();

    const result = await db.$transaction(async (tx) => {
      let updated = 0;

      for (const change of dedupedChanges) {
        const baseWhere: Prisma.PadronElectoralWhereInput = {
          id: change.electorId,
          eleccionId: election.id,
          deletedAt: null,
        };

        const where: Prisma.PadronElectoralWhereInput = mesa
          ? {
              ...baseWhere,
              establecimientoId: mesa.establecimientoId,
              numeroMesa: mesa.numero,
            }
          : baseWhere;

        const updateResult = await tx.padronElectoral.updateMany({
          where,
          data: {
            votoSiNo: change.voted ? "S" : "N",
            votedAt: change.voted ? now : null,
            votedBy: change.voted ? userId : null,
            updatedAt: now,
          },
        });

        updated += updateResult.count;
      }

      let stats:
        | {
            total: number;
            voted: number;
            notVoted: number;
          }
        | null = null;

      // Solo devolvemos stats de mesa cuando realmente estamos trabajando sobre una mesa concreta.
      if (mesa) {
        const total = await tx.padronElectoral.count({
          where: {
            eleccionId: mesa.eleccionId,
            establecimientoId: mesa.establecimientoId,
            numeroMesa: mesa.numero,
            deletedAt: null,
          },
        });

        const voted = await tx.padronElectoral.count({
          where: {
            eleccionId: mesa.eleccionId,
            establecimientoId: mesa.establecimientoId,
            numeroMesa: mesa.numero,
            deletedAt: null,
            votoSiNo: "S",
          },
        });

        stats = {
          total,
          voted,
          notVoted: total - voted,
        };
      }

      return {
        updated,
        stats,
      };
    });

    return NextResponse.json({
      ok: true,
      updated: result.updated,
      stats: result.stats,
      message: "Cambios guardados correctamente",
    });
  } catch (error) {
    console.error("[INTERNAL_VOTING_BATCH_POST]", error);

    return NextResponse.json(
      { error: "No se pudieron guardar los cambios" },
      { status: 500 }
    );
  }
});