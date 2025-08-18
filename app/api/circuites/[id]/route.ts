export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { getCircuitoById, softDeleteCircuito, updateCircuito } from "@/lib/_server/circuites.service";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";
import { db } from "@/lib/db";
import { jsonError, parseIdOrThrow } from "@/lib/utils/api-helpers";
import { formatApiMessage } from "@/lib/utils/formatters";
import { handleError } from "@/lib/utils/request-helpers";
import { NextRequest, NextResponse } from "next/server";

// GET: obtener circuito por ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseIdOrThrow(params.id); // asegurate que devuelva string si tu id es cuid
    const circuito = await getCircuitoById(id);
    if (!circuito) return jsonError("errors.circuiteNotFound", 404);
    return NextResponse.json(circuito);
  }
  catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") {
      return jsonError("errors.idInvalid");
    }
    return handleError(error);
  }
}

// PUT: actualizar nombre
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(req);
    const id = parseIdOrThrow(params.id);
    const { nombre, codigo } = await req.json();

    if (!nombre) return jsonError("required.name");
    if (!codigo) return jsonError("required.code");

    const updated = await updateCircuito({ id, nombre, codigo, userId });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.message === "INVALID_ID") {
      return jsonError("errors.idInvalid");
    }
    return handleError(error);
  }
}

// DELETE: borrado lógico
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(req);
    const id = parseIdOrThrow(params.id);

    await softDeleteCircuito(id, userId || undefined);
    return NextResponse.json({ message: formatApiMessage("success.circuiteDeleted") });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.message === "INVALID_ID") {
      return jsonError("errors.idInvalid");
    }
    return handleError(error);
  }
}