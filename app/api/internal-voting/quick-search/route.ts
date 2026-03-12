export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
    buildInternalVotingBase,
    normalizeVoteValue,
} from "../_lib";
import { withActiveElection } from "@/lib/_server/withActiveElection";

export const GET = withActiveElection(async (req, { election }) => {
    try {
        const { searchParams } = req.nextUrl;
        const referenteIdRaw = searchParams.get("referenteId");
        const planilleroIdRaw = searchParams.get("planilleroId");
        const planillaIdRaw = searchParams.get("planillaId");
        
        const referenteId = referenteIdRaw ? Number(referenteIdRaw) : undefined;
        const planilleroId = planilleroIdRaw ? Number(planilleroIdRaw) : undefined;
        const planillaId = planillaIdRaw ? Number(planillaIdRaw) : undefined;
        const q = (searchParams.get("q") || "").trim();

        const hasAnchorFilter =
            (referenteId !== undefined && !Number.isNaN(referenteId)) ||
            (planilleroId !== undefined && !Number.isNaN(planilleroId)) ||
            (planillaId !== undefined && !Number.isNaN(planillaId)) ||
            q.length >= 3;

        if (!hasAnchorFilter) {
            return NextResponse.json({ items: [] });
        }
        const { where } = await buildInternalVotingBase({
            electionId: election.id,
            referenteId: Number.isNaN(referenteId) ? undefined : referenteId,
            planilleroId: Number.isNaN(planilleroId) ? undefined : planilleroId,
            planillaId: Number.isNaN(planillaId) ? undefined : planillaId,
            q,
        });

        const rows = await db.padronElectoral.findMany({
            where,
            select: {
                id: true,
                apellido: true,
                nombre: true,
                numeroMatricula: true,
                ordenMesa: true,
                numeroMesa: true,
                votoSiNo: true,
                votedAt: true,
                telefono: true,

                establecimiento: {
                    select: {
                        nombre: true,
                    },
                },

                planilla: {
                    select: {
                        id: true,
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
                    },
                },
            },
            orderBy: [
                { votoSiNo: "asc" },
                { apellido: "asc" },
                { nombre: "asc" },
                { ordenMesa: "asc" },
            ],
        });

        const items = rows.map((row) => ({
            id: String(row.id),
            apellido: row.apellido,
            nombre: row.nombre,
            dni: row.numeroMatricula,
            numeroOrden: row.ordenMesa,
            mesaNumero: row.numeroMesa,
            votedAt: row.votedAt,
            votoSiNo: normalizeVoteValue(row.votoSiNo),
            telefono: row.telefono ?? null,
            establecimientoNombre: row.establecimiento?.nombre ?? null,
            planillaId: row.planilla?.id ? String(row.planilla.id) : null,
            numeroPlanilla: row.planilla?.numero ?? null,
            nombrePlanilla: row.planilla?.nombre ?? null,
            referente: row.referente?.nombre ?? null,
            planillero: row.planillero?.nombre ?? null,
            chofer: row.chofer?.nombre ?? null,
        }));

        return NextResponse.json({ items });
    } catch (error) {
        console.error("[INTERNAL_VOTING_QUICK_SEARCH_GET]", error);

        return NextResponse.json(
            { error: "No se pudieron cargar los votantes" },
            { status: 500 }
        );
    }
});