// src/lib/server/dashboard/especiales.ts

import { db } from "@/lib/db";

export async function getSpecialVotes
    (eleccionId: number) {
    const agg = await db.resultadoVotosEspeciales.aggregate({
        where: { eleccionId },
        _sum: {
            votosNulos: true,
            votosEnBlanco: true,
            votosRecurridos: true,
            votosImpugnados: true,
        },
    });

    const especiales = {
        nulos: agg._sum.votosNulos ?? 0,
        blancos: agg._sum.votosEnBlanco ?? 0,
        recurridos: agg._sum.votosRecurridos ?? 0,
        impugnados: agg._sum.votosImpugnados ?? 0,
    };

    return {
        ...especiales,
        total:
            especiales.nulos +
            especiales.blancos +
            especiales.recurridos +
            especiales.impugnados,
    };
}