export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  buildInternalVotingBase,
  parseGroupBy,
  GroupByMode,
} from "../_lib";
import { withActiveElection } from "@/lib/_server/withActiveElection";

type GroupSummary = {
  id: string;
  label: string;
  total: number;
  voted: number;
  notVoted: number;
  sortOrder: number;
};

const ORDER_CHUNK_SIZE = 100;

function getOrderGroup(ordenMesa: number | null | undefined) {
  const orden = Number(ordenMesa ?? 0);

  if (!orden || Number.isNaN(orden) || orden <= 0) {
    return {
      id: "sin-orden",
      label: "Sin orden",
      sortOrder: Number.MAX_SAFE_INTEGER,
    };
  }

  const from = Math.floor((orden - 1) / ORDER_CHUNK_SIZE) * ORDER_CHUNK_SIZE + 1;
  const to = from + ORDER_CHUNK_SIZE - 1;

  return {
    id: `${from}-${to}`,
    label: `Orden ${from} - ${to}`,
    sortOrder: from,
  };
}

function getPlanillaSort(numero?: string | null) {
  const n = Number(numero);
  return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
}

function getGroupMeta(row: any, groupBy: GroupByMode) {
  switch (groupBy) {
    case "planilla": {
      if (!row.planillaId || !row.planilla) {
        return {
          id: "0",
          label: "Sin planilla",
          sortOrder: Number.MAX_SAFE_INTEGER,
        };
      }

      const extra = row.planilla.nombre ? ` - ${row.planilla.nombre}` : "";

      return {
        id: String(row.planillaId),
        label: `Planilla ${row.planilla.numero}${extra}`,
        sortOrder: getPlanillaSort(row.planilla.numero),
      };
    }

    case "referente": {
      if (!row.referenteId || !row.referente) {
        return {
          id: "0",
          label: "Sin referente",
          sortOrder: Number.MAX_SAFE_INTEGER,
        };
      }

      return {
        id: String(row.referenteId),
        label: row.referente.nombre,
        sortOrder: 0,
      };
    }

    case "planillero": {
      if (!row.planilleroId || !row.planillero) {
        return {
          id: "0",
          label: "Sin planillero",
          sortOrder: Number.MAX_SAFE_INTEGER,
        };
      }

      return {
        id: String(row.planilleroId),
        label: row.planillero.nombre,
        sortOrder: 0,
      };
    }

    case "orden":
    default:
      return getOrderGroup(row.ordenMesa);
  }
}

export const GET = withActiveElection( async (req, {election}) => {
  try {
    const { searchParams } = req.nextUrl;

    const establecimientoId = Number(searchParams.get("establecimientoId") || "");
    const mesaId = Number(searchParams.get("mesaId") || "");
    const referenteId = Number(searchParams.get("referenteId") || "");
    const planilleroId = Number(searchParams.get("planilleroId") || "");
    const q = (searchParams.get("q") || "").trim();
    const groupBy = parseGroupBy(searchParams.get("groupBy"));

    const { where } = await buildInternalVotingBase({
      electionId: election.id,
      establecimientoId: Number.isNaN(establecimientoId) ? undefined : establecimientoId,
      mesaId: Number.isNaN(mesaId) ? undefined : mesaId,
      referenteId: Number.isNaN(referenteId) ? undefined : referenteId,
      planilleroId: Number.isNaN(planilleroId) ? undefined : planilleroId,
      q,
    });

    const rows = await db.padronElectoral.findMany({
      where,
      select: {
        id: true,
        ordenMesa: true,
        votoSiNo: true,

        planillaId: true,
        planilla: {
          select: {
            numero: true,
            nombre: true,
          },
        },

        referenteId: true,
        referente: {
          select: {
            nombre: true,
          },
        },

        planilleroId: true,
        planillero: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: [{ ordenMesa: "asc" }],
    });

    const grouped = new Map<string, GroupSummary>();

    for (const row of rows) {
      const meta = getGroupMeta(row, groupBy);
      const voted = row.votoSiNo === "S" ? 1 : 0;

      const existing = grouped.get(meta.id);

      if (existing) {
        existing.total += 1;
        existing.voted += voted;
        existing.notVoted += voted ? 0 : 1;
      } else {
        grouped.set(meta.id, {
          id: meta.id,
          label: meta.label,
          total: 1,
          voted,
          notVoted: voted ? 0 : 1,
          sortOrder: meta.sortOrder,
        });
      }
    }

    const items = Array.from(grouped.values())
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.label.localeCompare(b.label, "es", { sensitivity: "base" });
      })
      .map(({ sortOrder, ...rest }) => rest);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("[INTERNAL_VOTING_SUMMARY_GET]", error);
    return NextResponse.json(
      { error: "No se pudo cargar el resumen de votación interna" },
      { status: 500 }
    );
  }
});