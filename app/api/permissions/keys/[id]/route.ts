export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";
import { db } from "@/lib/db";
import { jsonError, parseIdOrThrow } from "@/lib/utils/api-helpers";
import { formatApiMessage } from "@/lib/utils/formatters";
import { handleError } from "@/lib/utils/request-helpers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseIdOrThrow(params.id);

  const permisos = await db.permiso.findFirst({ where: { id } });

  if (!permisos) return NextResponse.json({ error: formatApiMessage("errors.permissionKeyNotFound") }, { status: 404 });

  return NextResponse.json(permisos);
}

// PUT: actualizar circuito
export async function PUT(req: NextRequest, { params }: { params: { id: number } }) {
  try {
    const id = parseIdOrThrow(params.id.toString());

    const { clave, descripcion, accion, modulo } = await req.json();

    if (!clave) return jsonError("required.clave");
    if (!descripcion) return jsonError("required.descripcion");
    if (!accion) return jsonError("required.accion");
    if (!modulo) return jsonError("required.modulo");

    const updated = await db.permiso.update({
      where: { id },
      data: { clave, descripcion, accion, modulo},
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
    const id = parseIdOrThrow(params.id);

    await db.permiso.update({
      where: { id },
      data: { deletedAt: new Date()},
    });

    return NextResponse.json({ message: formatApiMessage("success.permissionKeyDeleted") });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.message === "INVALID_ID") return jsonError("errors.idInvalid");
    return handleError(error);
  }
}