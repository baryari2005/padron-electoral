import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";
import { db } from "@/lib/db";
import { jsonError, parseIdOrThrow } from "@/lib/utils/api-helpers";
import { formatApiMessage } from "@/lib/utils/formatters";
import { handleError } from "@/lib/utils/request-helpers";
import { NextRequest, NextResponse } from "next/server";

// GET: obtener circuito por ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseIdOrThrow(params.id);

  const circuites = await db.circuito.findFirst({ where: { id } });

  if (!circuites) return NextResponse.json({ error: formatApiMessage("errors.circuiteNotFound") }, { status: 404 });

  return NextResponse.json(circuites);
}

// PUT: actualizar circuito
export async function PUT(req: NextRequest, { params }: { params: { id: number } }) {
  try {
    const userId = getUserIdFromRequest(req);
    const id = parseIdOrThrow(params.id.toString());

    const { nombre, codigo } = await req.json();

    if (!nombre) return jsonError("required.name");
    if (!codigo) return jsonError("required.code");

    const updated = await db.circuito.update({
      where: { id },
      data: { nombre, codigo, userId },
    });

    return NextResponse.json(updated);
  }
  catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.message === "INVALID_ID") return jsonError("errors.idInvalid");
    return handleError(error);
  }

}

// DELETE: borrado lógico
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(req);
    const id = parseIdOrThrow(params.id);

    await db.circuito.update({
      where: { id },
      data: { deletedAt: new Date(), userId },
    });

    return NextResponse.json({ message: formatApiMessage("success.circuiteDeleted") });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.message === "INVALID_ID") return jsonError("errors.idInvalid");
    return handleError(error);
  }
}