// src/lib/server/dashboard/top.ts

import { db } from "@/lib/db";

export async function getTopVotes(eleccionId: number) {
    const mesas = await db.mesaEscrutada.findMany({
        where: { deletedAt: null, eleccionId },
        select: { id: true, establecimientoId: true, circuitoId: true },
    });

    const mesaInfo = new Map(mesas.map((m) => [m.id, m]));

    const votosPorMesa = await db.resultadoPorAgrupacionPolitica.groupBy({
        by: ["mesaId"],
        where: { eleccionId },
        _sum: { votos: true },
    });

    const votosPorEst: Record<number, number> = {};
    const votosPorCirc: Record<number, number> = {};

    for (const vm of votosPorMesa) {
        const info = mesaInfo.get(vm.mesaId);
        if (!info) continue;

        const votos = vm._sum.votos ?? 0;
        votosPorEst[info.establecimientoId] =
            (votosPorEst[info.establecimientoId] ?? 0) + votos;

        votosPorCirc[info.circuitoId] =
            (votosPorCirc[info.circuitoId] ?? 0) + votos;
    }

    const votantesPorMesa = await db.resultadoPorMesa.findMany({
        where: { eleccionId },
        select: { mesaId: true, electoresVotaron: true, sobresEnUrna: true },
    });
    const votantesPorEst: Record<number, number> = {};
    const votantesPorCir: Record<number, number> = {};

    for (const r of votantesPorMesa) {
        const info = mesaInfo.get(r.mesaId);
        if (!info) continue;
        const val = r.electoresVotaron ?? r.sobresEnUrna ?? 0;
        votantesPorEst[info.establecimientoId] = (votantesPorEst[info.establecimientoId] ?? 0) + val;
        votantesPorCir[info.circuitoId] = (votantesPorCir[info.circuitoId] ?? 0) + val;
    }

    const establecimientos = await db.establecimiento.findMany({
        where: { eleccionId },
        select: { id: true, nombre: true },
    });

    const circuitos = await db.circuito.findMany({
        where: { eleccionId },
        select: { id: true, nombre: true, codigo: true },
    });

    const estName = new Map(establecimientos.map((e) => [e.id, e.nombre]));
    const cirName = new Map(
        circuitos.map((c) => [c.id, c.nombre || c.codigo])
    );

    const topEstablecimientos = Object.entries(votosPorEst)
        .map(([id, votos]) => ({
            establecimientoId: +id,
            establecimiento: estName.get(+id) ?? `ID ${id}`,
            votos,
        }))
        .sort((a, b) => b.votos - a.votos)
        .slice(0, 5);

    const topCircuitos = Object.entries(votosPorCirc)
        .map(([id, votos]) => ({
            circuitoId: +id,
            circuito: cirName.get(+id) ?? `ID ${id}`,
            votos,
        }))
        .sort((a, b) => b.votos - a.votos)
        .slice(0, 5);

    return {
        establecimientos: topEstablecimientos,
        circuitos: topCircuitos,
    };
}