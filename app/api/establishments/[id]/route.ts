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
import { getById, softDelete } from "@/lib/_server/establishments.service";
import { updateEstablecimiento } from "./service";

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

    const body = await req.json().catch(() => ({}));
    const { nombre, direccion, profileImage, circuitoId, numerosDeMesa } = body;

    if (!nombre) return jsonError("required.name");
    if (!direccion) return jsonError("required.street");
    if (!circuitoId) return jsonError("required.circuite");

    // 👇 Solo incluimos numerosDeMesa si realmente vino en el body.
    const mesasProvided: number[] | undefined =
      Array.isArray(numerosDeMesa) ? numerosDeMesa.map(Number) : undefined;

    const result = await updateEstablecimiento({
      id,
      nombre,
      direccion,
      profileImage: (typeof profileImage === "string" || profileImage === null) ? profileImage : undefined,
      circuitoId: Number(circuitoId),
      userId,
      ...(mesasProvided !== undefined ? { numerosDeMesa: mesasProvided } : {}),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    // Si el service tira status (ej. 409), respetalo
    if (error?.status) {
      return NextResponse.json({ ok: false, message: String(error.message ?? "Conflict") }, { status: error.status });
    }
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
