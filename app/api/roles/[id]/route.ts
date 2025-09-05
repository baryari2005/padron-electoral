export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { db } from "@/lib/db";
import { jsonError, parseIdOrThrow } from "@/lib/utils/api-helpers";
import { formatApiMessage } from "@/lib/utils/formatters";
import { handleError } from "@/lib/utils/request-helpers";
import { NextRequest, NextResponse } from "next/server";

// GET Rol por ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseIdOrThrow(params.id);
    const roles = await db.rol.findFirst({ where: { id } });

    if (!roles) return NextResponse.json({ error: formatApiMessage("errors.roleNotFound") }, { status: 404 });

    return NextResponse.json(roles);

  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") return jsonError("errors.idInvalid");
    return handleError(error);
  }
}

// PUT: actualizar rol
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseIdOrThrow(params.id);
    const { nombre, requiereEstablecimientos, puedeAsignarEstablecimientos } = await req.json();
    if (!nombre) return jsonError("required.name");

    const updated = await db.rol.update({
      where: { id },
      data: { nombre, requiereEstablecimientos, puedeAsignarEstablecimientos },
    });

    return NextResponse.json(updated);
  }
  catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") return jsonError("errors.idInvalid");
    return handleError(error);
  }
}

// DELETE: borrado lógico
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseIdOrThrow(params.id);
    
    await db.rol.delete({
      where: { id }
    });

    return NextResponse.json({ message: formatApiMessage("success.roleDeleted") });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") return jsonError("errors.idInvalid");
    return handleError(error);
  }
}