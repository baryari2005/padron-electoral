export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError, parseIdOrThrow } from "@/lib/utils/api-helpers";
import { handleError } from "@/lib/utils/request-helpers";
import { formatApiMessage } from "@/lib/utils/formatters";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";

// GET: obtener un establecimiento por ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseIdOrThrow(params.id);

    const establecimiento = await db.establecimiento.findFirst({
      where: { id },
      include: {
        circuito: true,
        mesasPorEstablecimiento: true,
      },
    });

    if (!establecimiento) return jsonError("errors.establishmentNotFound", 404);

    return NextResponse.json(establecimiento);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") return jsonError("errors.idInvalid");
    return handleError(error);
  }
}

// PUT: actualizar un establecimiento
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseIdOrThrow(params.id);
    const userId = getUserIdFromRequest(req);

    const { nombre, direccion, profileImage, circuitoId, numerosDeMesa } = await req.json();

    if (!nombre) return jsonError("required.name");
    if (!direccion) return jsonError("required.street");
    if (!circuitoId) return jsonError("required.circuite");

    const updated = await db.establecimiento.update({
      where: { id },
      data: {
        nombre,
        direccion,
        profileImage,
        circuitoId,
        userId,
        mesasPorEstablecimiento: {
          deleteMany: {}, // 👈 borra todas las mesas actuales del establecimiento
          create: numerosDeMesa.map((numero: number) => ({ numero, userId })),
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.message === "INVALID_ID") return jsonError("errors.idInvalid");
    return handleError(error);
  }
}

// DELETE: borrado lógico
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseIdOrThrow(params.id);
    const userId = getUserIdFromRequest(req);

    await db.$transaction([
      db.mesasPorEstablecimiento.updateMany({
        where: { establecimientoId: id },
        data: { deletedAt: new Date(), userId },
      }),
      db.establecimiento.update({
        where: { id },
        data: {
          deletedAt: new Date(), userId
        },
      })
    ]);
    return NextResponse.json({ message: formatApiMessage("success.establishmentDeleted") });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.message === "INVALID_ID") return jsonError("errors.idInvalid");
    return handleError(error);
  }
}
