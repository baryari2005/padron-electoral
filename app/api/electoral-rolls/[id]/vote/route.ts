export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextRequest, NextResponse } from "next/server";

// import { getUser } from "@/lib/auth"; // si tenés auth


import { db } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";
import { emitVoteChange } from "@/app/lib/vote-stream";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const userId = getUserIdFromRequest(req);
    const id = Number(params.id);
    if (Number.isNaN(id)) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const voted: boolean = !!body?.voted;
    const method: "manual" | "scan" | undefined = body?.method;
    const stationId: string | undefined = body?.stationId;

    // const user = await getUser(); // opcional
    // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Obtener mesaId para broadcastear a la sala correcta
    const current = await db.padronElectoral.findUnique({
        where: { id },
        select: { numeroMesa: true },
    });
    if (!current) {
        return NextResponse.json({ error: "Elector no encontrado" }, { status: 404 });
    }

    const updated = await db.padronElectoral.update({
        where: { id },
        data: {
            votedAt: voted ? new Date() : null,
            votedBy: voted ? userId : null, // user?.id ?? "system"
        },
        select: {
            id: true, numeroMatricula: true, apellido: true, nombre: true,
            numeroMesa: true, votedAt: true, votedBy: true
        },
    });

    // Emitir evento SSE para esta mesa
    emitVoteChange(String(current.numeroMesa), {
        type: "vote-changed",
        electorId: updated.id,
        votedAt: updated.votedAt,
        method,
        stationId,
        // by: user?.id ?? null,
    });

    return NextResponse.json(updated);
}
