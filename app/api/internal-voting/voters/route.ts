export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  buildInternalVotingBase,
  normalizeVoteValue,
  parseGroupBy,
} from "../_lib";
import { withActiveElection } from "@/lib/_server/withActiveElection";

function buildGroupWhere(groupBy: "orden" | "referente" | "planillero" | "planilla", groupValue: string) {
  if (groupBy === "orden") {
    if (groupValue === "sin-orden") {
      return {
        OR: [{ ordenMesa: 0 }],
      } satisfies Prisma.PadronElectoralWhereInput;
    }

    const [fromRaw, toRaw] = groupValue.split("-");
    const from = Number(fromRaw);
    const to = Number(toRaw);

    if (!Number.isNaN(from) && !Number.isNaN(to)) {
      return {
        ordenMesa: {
          gte: from,
          lte: to,
        },
      } satisfies Prisma.PadronElectoralWhereInput;
    }

    return {};
  }

  if (groupBy === "planilla") {
    if (groupValue === "0") {
      return { planillaId: null } satisfies Prisma.PadronElectoralWhereInput;
    }

    const planillaId = Number(groupValue);
    if (!Number.isNaN(planillaId)) {
      return { planillaId } satisfies Prisma.PadronElectoralWhereInput;
    }

    return {};
  }

  if (groupBy === "referente") {
    if (groupValue === "0") {
      return { referenteId: null } satisfies Prisma.PadronElectoralWhereInput;
    }

    const referenteId = Number(groupValue);
    if (!Number.isNaN(referenteId)) {
      return { referenteId } satisfies Prisma.PadronElectoralWhereInput;
    }

    return {};
  }

  if (groupBy === "planillero") {
    if (groupValue === "0") {
      return { planilleroId: null } satisfies Prisma.PadronElectoralWhereInput;
    }

    const planilleroId = Number(groupValue);
    if (!Number.isNaN(planilleroId)) {
      return { planilleroId } satisfies Prisma.PadronElectoralWhereInput;
    }

    return {};
  }

  return {};
}

export const GET = withActiveElection(async (req, {election}) => {
  try {
    const { searchParams } = req.nextUrl;

    const establecimientoId = Number(searchParams.get("establecimientoId") || "");
    const mesaId = Number(searchParams.get("mesaId") || "");
    const referenteId = Number(searchParams.get("referenteId") || "");
    const planilleroId = Number(searchParams.get("planilleroId") || "");
    const q = (searchParams.get("q") || "").trim();
    const groupBy = parseGroupBy(searchParams.get("groupBy"));
    const groupValue = (searchParams.get("groupValue") || "").trim();

    const { where } = await buildInternalVotingBase({
      electionId: election.id,
      establecimientoId: Number.isNaN(establecimientoId) ? undefined : establecimientoId,
      mesaId: Number.isNaN(mesaId) ? undefined : mesaId,
      referenteId: Number.isNaN(referenteId) ? undefined : referenteId,
      planilleroId: Number.isNaN(planilleroId) ? undefined : planilleroId,
      q,
    });

    const groupWhere = buildGroupWhere(groupBy, groupValue);

    const finalWhere: Prisma.PadronElectoralWhereInput = {
      AND: [where, groupWhere],
    };

    const rows = await db.padronElectoral.findMany({
      where: finalWhere,
      select: {
        id: true,
        apellido: true,
        nombre: true,
        numeroMatricula: true,
        ordenMesa: true,
        votoSiNo: true,
        votedAt: true,
        telefono: true,

        establecimiento: {
          select: {
            nombre: true,
          }
        },

        planilla: {
          select: {
            numero: true,
            nombre: true,
          },
        },

        referente: {
          select: {
            nombre: true,
          },
        },

        planillero: {
          select: {
            nombre: true,
          },          
        },

        chofer: {
          select: {
            nombre: true,
          }
        }
      },
      orderBy: [
        { ordenMesa: "asc" },
        { apellido: "asc" },
        { nombre: "asc" },
      ],
    });

    const items = rows.map((row) => ({
      id: String(row.id),
      apellido: row.apellido,
      nombre: row.nombre,
      dni: row.numeroMatricula,
      numeroOrden: row.ordenMesa,
      votedAt: row.votedAt,
      votoSiNo: normalizeVoteValue(row.votoSiNo),
      telefono: row.telefono ?? null,
      establecimientoNombre: row.establecimiento?.nombre ?? null,
      numeroPlanilla: row.planilla?.numero ?? null,
      nombrePlanilla: row.planilla?.nombre ?? null,
      referente: row.referente?.nombre ?? null,
      planillero: row.planillero?.nombre ?? null,
      chofer: row.chofer?.nombre ?? null,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("[INTERNAL_VOTING_VOTERS_GET]", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los votantes del grupo" },
      { status: 500 }
    );
  }
});