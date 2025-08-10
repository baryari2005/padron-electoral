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

// GET Agrupación por ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseIdOrThrow(params.id);

    const agrupacion = await db.agrupacionPolitica.findFirst({ where: { id } });

    if (!agrupacion) return jsonError("errors.politicalGroupNotFound", 404);

    return NextResponse.json(agrupacion);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") return jsonError("errors.idInvalid");
    return handleError(error);
  }
}

// PUT: actualizar agrupación
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(req);
    const id = parseIdOrThrow(params.id);
    const { nombre, numero, profileImage } = await req.json();

    if (!nombre) return jsonError("required.name");
    if (!numero) return jsonError("required.number");

    const updated = await db.agrupacionPolitica.update({
      where: { id },
      data: {
        nombre,
        numero,
        profileImage,
        userId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") return jsonError("errors.idInvalid");
    return handleError(error);
  }
}

// DELETE: borrado lógico
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(req);
    const id = parseIdOrThrow(params.id);

    await db.agrupacionPolitica.update({
      where: { id },
      data: { deletedAt: new Date(), userId},
    });

    return NextResponse.json({ message: formatApiMessage("success.politicalGroupDeleted") });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") return jsonError("errors.idInvalid");
    return handleError(error);
  }
}