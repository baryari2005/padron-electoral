// app/api/internal-voting/voters/paginated/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  buildInternalVotingBase,
  normalizeVoteValue,
  parseGroupBy,
} from "../../_lib";
import { withActiveElection } from "@/lib/_server/withActiveElection";

function parsePositiveInt(value: string | null, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function buildGroupWhere(
  groupBy: "orden" | "referente" | "planillero" | "planilla",
  groupValue: string
): Prisma.PadronElectoralWhereInput {
  if (groupBy === "orden") {
    if (groupValue === "sin-orden") {
      return { OR: [{ ordenMesa: 0 }] };
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
      };
    }

    return {};
  }

  if (groupBy === "planilla") {
    if (groupValue === "0") return { planillaId: null };
    const planillaId = Number(groupValue);
    if (!Number.isNaN(planillaId)) return { planillaId };
    return {};
  }

  if (groupBy === "referente") {
    if (groupValue === "0") return { referenteId: null };
    const referenteId = Number(groupValue);
    if (!Number.isNaN(referenteId)) return { referenteId };
    return {};
  }

  if (groupBy === "planillero") {
    if (groupValue === "0") return { planilleroId: null };
    const planilleroId = Number(groupValue);
    if (!Number.isNaN(planilleroId)) return { planilleroId };
    return {};
  }

  return {};
}

function buildOrderBy(
  sortBy: string | null,
  sortDir: "asc" | "desc"
): Prisma.PadronElectoralOrderByWithRelationInput[] {
  const sortableFields: Record<
    string,
    Prisma.PadronElectoralOrderByWithRelationInput
  > = {
    apellido: { apellido: sortDir },
    nombre: { nombre: sortDir },
    dni: { numeroMatricula: sortDir },
    numeroMatricula: { numeroMatricula: sortDir },
    numeroOrden: { ordenMesa: sortDir },
    ordenMesa: { ordenMesa: sortDir },
    telefono: { telefono: sortDir },

    votedAt: {
      votedAt: {
        sort: sortDir,
        nulls: "first",
      },
    },

    estado: { votoSiNo: sortDir },
    votoSiNo: { votoSiNo: sortDir },

    establecimiento: {
      establecimiento: {
        nombre: sortDir,
      },
    },

    numeroPlanilla: {
      planilla: {
        numero: sortDir,
      },
    },

    planillero: {
      planillero: {
        nombre: sortDir,
      },
    },

    referente: {
      referente: {
        nombre: sortDir,
      },
    },

    chofer: {
      chofer: {
        nombre: sortDir,
      },
    },
  };

  const dynamicOrder =
    sortBy && sortableFields[sortBy]
      ? [sortableFields[sortBy]]
      : [];

  return [
    { votoSiNo: "asc" },
    ...dynamicOrder,
    { ordenMesa: "asc" },
    { apellido: "asc" },
    { nombre: "asc" },
  ];
}

export const GET = withActiveElection(async (req, { election }) => {
  try {
    const { searchParams } = req.nextUrl;

    const establecimientoId = Number(searchParams.get("establecimientoId") || "");
    const mesaId = Number(searchParams.get("mesaId") || "");
    const referenteId = Number(searchParams.get("referenteId") || "");
    const planilleroId = Number(searchParams.get("planilleroId") || "");

    const q =
      (searchParams.get("q") || searchParams.get("search") || "").trim();

    const groupBy = parseGroupBy(searchParams.get("groupBy"));
    const groupValue = (searchParams.get("groupValue") || "").trim();

    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 10), 100);
    const skip = (page - 1) * limit;

    const sortBy = searchParams.get("sortBy");
    const sortDir =
      searchParams.get("sortDir") === "desc" ? "desc" : "asc";

    const { where } = await buildInternalVotingBase({
      electionId: election.id,
      establecimientoId: Number.isNaN(establecimientoId)
        ? undefined
        : establecimientoId,
      mesaId: Number.isNaN(mesaId) ? undefined : mesaId,
      referenteId: Number.isNaN(referenteId)
        ? undefined
        : referenteId,
      planilleroId: Number.isNaN(planilleroId)
        ? undefined
        : planilleroId,
      q,
    });

    const groupWhere = buildGroupWhere(groupBy, groupValue);

    const andFilters: Prisma.PadronElectoralWhereInput[] = [where];
    if (Object.keys(groupWhere).length > 0) {
      andFilters.push(groupWhere);
    }

    const finalWhere: Prisma.PadronElectoralWhereInput = {
      AND: andFilters,
    };

    const orderBy = buildOrderBy(sortBy, sortDir);

    const [rows, total] = await Promise.all([
      db.padronElectoral.findMany({
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
          establecimiento: { select: { nombre: true } },
          planilla: { select: { numero: true, nombre: true } },
          referente: { select: { nombre: true } },
          planillero: { select: { nombre: true } },
          chofer: { select: { nombre: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.padronElectoral.count({
        where: finalWhere,
      }),
    ]);

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

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[INTERNAL_VOTING_VOTERS_PAGINATED_GET]", error);

    return NextResponse.json(
      { error: "No se pudieron cargar los votantes paginados" },
      { status: 500 }
    );
  }
});