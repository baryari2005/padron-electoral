// app/api/establishments/[id]/service.ts
import { db } from "@/lib/db";

type UpdateInput = {
    id: number;
    nombre: string;
    direccion: string;
    profileImage?: string | null;  // opcional (si no viene, no se toca)
    circuitoId: number;
    userId: string;                // trazabilidad
    numerosDeMesa?: number[];      // opcional: si no viene, NO se tocan mesas
    eleccionId: number
};

export async function updateEstablecimiento(input: UpdateInput) {
    const { id, nombre, direccion, profileImage, circuitoId, userId, numerosDeMesa, eleccionId } = input;

    return await db.$transaction(async (tx) => {
        // 1) Actualizar campos simples del establecimiento (sin tocar mesas aún)
        await tx.establecimiento.update({
            where: { id, eleccionId },
            data: {
                nombre,
                direccion,
                circuitoId,                
                userId,
                eleccionId,
                ...(profileImage !== undefined ? { profileImage } : {}),
            },
        });

        // 2) Si no vino numerosDeMesa, terminamos acá
        if (numerosDeMesa === undefined) {
            return { ok: true };
        }

        // 3) Leer mesas actuales
        const actuales = await tx.mesasPorEstablecimiento.findMany({
            where: { establecimientoId: id },
            select: { numero: true },
        });

        const actualesSet = new Set(actuales.map(m => m.numero));
        const nuevasSet = new Set(numerosDeMesa.map(Number));

        const toAdd = Array.from(nuevasSet).filter(n => !actualesSet.has(n));
        const toRemove = Array.from(actualesSet).filter(n => !nuevasSet.has(n));

        // 4) Bloquear eliminación si alguna mesa tiene escrutinio
        if (toRemove.length) {
            const bloqueadas = await tx.mesaEscrutada.findMany({
                where: { establecimientoId: id, numero: { in: toRemove }, deletedAt: null },
                select: { numero: true },
            });

            if (bloqueadas.length) {
                const msg =
                    "No se pueden eliminar/renumerar estas mesas porque tienen escrutinio cargado: " +
                    bloqueadas.map((b) => b.numero).sort((a, b) => a - b).join(", ");
                const err: any = new Error(msg);
                err.status = 409; // Conflict
                throw err;
            }
        }

        // 5) Aplicar cambios
        if (toAdd.length) {
            await tx.mesasPorEstablecimiento.createMany({
                data: Array.from(toAdd).map((n) => ({
                    establecimientoId: id,
                    numero: n,
                    userId,
                    eleccionId
                })),
                skipDuplicates: true,
            });
        }

        if (toRemove.length) {
            await tx.mesasPorEstablecimiento.deleteMany({
                where: { establecimientoId: id, numero: { in: toRemove }, eleccionId },
            });
        }

        return { ok: true };
    });
}
