export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withActiveElection } from "@/lib/_server/withActiveElection";

export const GET = withActiveElection(async (req, { election }) => {
  try {
    const { searchParams } = req.nextUrl;

    const referenteIdRaw = searchParams.get("referenteId");
    const planilleroIdRaw = searchParams.get("planilleroId");

    const referenteId = referenteIdRaw ? Number(referenteIdRaw) : undefined;
    const planilleroId = planilleroIdRaw ? Number(planilleroIdRaw) : undefined;

    const baseWhere = {
      eleccionId: election.id,
      deletedAt: null,
      ...(referenteId && !Number.isNaN(referenteId) ? { referenteId } : {}),
      ...(planilleroId && !Number.isNaN(planilleroId) ? { planilleroId } : {}),
    };

    const referentesRows = await db.padronElectoral.findMany({
      where: {
        eleccionId: election.id,
        deletedAt: null,
        referenteId: { not: null },
      },
      select: {
        referente: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      distinct: ["referenteId"],
    });

    const planillerosRows = await db.padronElectoral.findMany({
      where: {
        eleccionId: election.id,
        deletedAt: null,
        planilleroId: { not: null },
        ...(referenteId && !Number.isNaN(referenteId) ? { referenteId } : {}),
      },
      select: {
        planillero: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      distinct: ["planilleroId"],
    });

    const planillasRows = await db.padronElectoral.findMany({
      where: {
        ...baseWhere,
        planillaId: { not: null },
      },
      select: {
        planilla: {
          select: {
            id: true,
            numero: true,
            nombre: true,
          },
        },
      },
      distinct: ["planillaId"],
    });

    const referentes = referentesRows
      .map((row) => row.referente)
      .filter(
        (item): item is { id: number; nombre: string } =>
          Boolean(item?.id && item?.nombre)
      )
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      );

    const planilleros = planillerosRows
      .map((row) => row.planillero)
      .filter(
        (item): item is { id: number; nombre: string } =>
          Boolean(item?.id && item?.nombre)
      )
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      );

   const planillas = planillasRows
  .flatMap((row) => {
    const item = row.planilla;

    if (!item) return [];

    return [
      {
        id: item.id,
        nombre: item.numero
          ? `Planilla ${item.numero}${item.nombre ? ` - ${item.nombre}` : ""}`
          : item.nombre || `Planilla ${item.id}`,
      },
    ];
  })
  .sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", {
      sensitivity: "base",
      numeric: true,
    })
  );

    return NextResponse.json({
      referentes,
      planilleros,
      planillas,
    });
  } catch (error) {
    console.error("[INTERNAL_VOTING_GRAPHIC_FILTER_OPTIONS_GET]", error);

    return NextResponse.json(
      { error: "No se pudieron cargar los filtros gráficos" },
      { status: 500 }
    );
  }
});