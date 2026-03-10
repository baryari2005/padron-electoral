export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withActiveElection } from "@/lib/_server/withActiveElection";

export const GET = withActiveElection( async (req, {election}) => {
  try {
    const { searchParams } = req.nextUrl;
    const referenteIdRaw = searchParams.get("referenteId");
    const referenteId = referenteIdRaw ? Number(referenteIdRaw) : undefined;
    
    if (!election) {
      return NextResponse.json(
        { error: "No hay una elección activa" },
        { status: 400 }
      );
    }

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
        ...(referenteId && !Number.isNaN(referenteId)
          ? { referenteId }
          : {}),
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

    const referentes = referentesRows
      .map((row) => row.referente)
      .filter(
        (item): item is { id: number; nombre: string } =>
          Boolean(item?.id && item?.nombre)
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

    const planilleros = planillerosRows
      .map((row) => row.planillero)
      .filter(
        (item): item is { id: number; nombre: string } =>
          Boolean(item?.id && item?.nombre)
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

    return NextResponse.json({
      referentes,
      planilleros,
    });
  } catch (error) {
    console.error("[INTERNAL_VOTING_FILTER_OPTIONS_GET]", error);

    return NextResponse.json(
      { error: "No se pudieron cargar los filtros" },
      { status: 500 }
    );
  }
});