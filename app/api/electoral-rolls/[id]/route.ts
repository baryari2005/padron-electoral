export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { electoralRollSchema } from "@/app/(dashboard)/electoral-rolls/lib";
import { getAuthOrThrow } from "@/utils/auth";
import { withActiveElection } from "@/lib/_server/withActiveElection";
import { Prisma } from "@prisma/client";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";

export const GET = withActiveElection(async (req, { params, election }) => {
  let userId: string;

  try {
    const auth = getAuthOrThrow(req);
    userId = auth.userId;
  } catch (err) {
    return new NextResponse((err as Response).statusText, { status: (err as Response).status });
  }

  const id = parseInt(params!.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

  const elector = await db.padronElectoral.findFirst({
    where: { id, eleccionId: election.id }
  });

  if (!elector) {
    return NextResponse.json({ error: "Elector no encontrado" }, { status: 404 });
  }

  return NextResponse.json(elector);
});
export const PUT = withActiveElection(async (req, { params, election }) => {
  try {
    const id = parseInt(params!.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const data = electoralRollSchema.parse(body);

    const updated = await db.padronElectoral.update({
      where: { id, eleccionId: election.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Error al actualizar el registro" },
      { status: 500 }
    );
  }
});

async function softDelete(id: number,  eleccionId: number, userId?: string) {
    const data: Prisma.PadronElectoralUpdateInput = { deletedAt: { set: new Date() } };
    if (userId) data.userId = userId;
    return db.padronElectoral.update({ where: { id,  eleccionId }, data });
}

export const DELETE = withActiveElection(async (req, { params, election }) => {
  try {
    const id = parseInt(params!.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const userId = getUserIdFromRequest(req);

    await softDelete(id, election.id, userId || undefined );

    return NextResponse.json({ message: "Registro eliminado" });
  } catch (error: any) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Error al eliminar el registro" },
      { status: 500 }
    );
  }
});
