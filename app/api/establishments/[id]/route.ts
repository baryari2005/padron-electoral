// app/api/establishments/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";
import { jsonError, parseIdOrThrow } from "@/lib/utils/api-helpers";
import { handleError } from "@/lib/utils/request-helpers";
import { formatApiMessage } from "@/lib/utils/formatters";
import { getById, softDelete, update } from "@/lib/_server/establishments.service";

/** GET: obtener un establecimiento por ID */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseIdOrThrow(params.id);
    const establecimiento = await getById(id);
    if (!establecimiento) return jsonError("errors.establishmentNotFound", 404);
    return NextResponse.json(establecimiento);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") {
      return jsonError("errors.idInvalid");
    }
    return handleError(error);
  }
}

/** PUT: actualizar establecimiento (+ reemplazo total de mesas) */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseIdOrThrow(params.id);
    const userId = getUserIdFromRequest(req);

    const { nombre, direccion, profileImage, circuitoId, numerosDeMesa } = await req.json();

    if (!nombre) return jsonError("required.name");
    if (!direccion) return jsonError("required.street");
    if (!circuitoId) return jsonError("required.circuite");

    const updated = await update({
      id,
      nombre,
      direccion,
      profileImage,
      circuitoId: Number(circuitoId),
      userId,
      numerosDeMesa: Array.isArray(numerosDeMesa) ? numerosDeMesa : [],
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.message === "INVALID_ID") {
      return jsonError("errors.idInvalid");
    }
    return handleError(error);
  }
}

/** DELETE: borrado lógico (establecimiento + mesas) */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseIdOrThrow(params.id);
    const userId = getUserIdFromRequest(req);

    await softDelete(id, userId);
    return NextResponse.json({ message: formatApiMessage("success.establishmentDeleted") });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.message === "INVALID_ID") {
      return jsonError("errors.idInvalid");
    }
    return handleError(error);
  }
}
