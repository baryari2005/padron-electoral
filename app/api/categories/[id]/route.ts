import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";
import { db } from "@/lib/db";
import { jsonError, parseIdOrThrow } from "@/lib/utils/api-helpers";
import { formatApiMessage } from "@/lib/utils/formatters";
import { handleError } from "@/lib/utils/request-helpers";
import { NextRequest, NextResponse } from "next/server";

// GET: obtener cargo político por ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseIdOrThrow(params.id);

    const cargo = await db.cargoPolitico.findFirst({
      where: { id },
    });

    if (!cargo) return jsonError("errors.categoryNotFound", 404);

    return NextResponse.json(cargo);
  } catch (error) {
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
    const { nombre } = await req.json();

    if (!nombre) return jsonError("required.name");

    const updated = await db.cargoPolitico.update({
      where: { id },
      data: { nombre, userId },
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

// DELETE: borrado lógico
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(req);
    const id = parseIdOrThrow(params.id);

    await db.cargoPolitico.update({
      where: { id },
      data: { deletedAt: new Date(), userId },
    });

    return NextResponse.json({ message: formatApiMessage("success.categoryDeleted") });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.message === "INVALID_ID") {
      return jsonError("errors.idInvalid");
    }
    return handleError(error);
  }
}