import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withActiveElection } from "@/lib/_server/withActiveElection";
import { jsonError, parseIdOrThrow } from "@/lib/utils/api-helpers";
import { handleError } from "@/lib/utils/request-helpers";

async function getById(id: number, eleccionId: number) {
  return db.personaOperativa.findFirst({
    where: {
      id,
      eleccionId
    }
  });
}

export const GET = withActiveElection(
  async (req, { params, election }) => {
    try {
      const id = parseIdOrThrow(params!.id);

      console.log(params!.id, election.id);

      const persona = await getById(id, election.id);

      if (!persona) return jsonError("errors.operationaPersonNotFound", 404);
      return NextResponse.json(persona);
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_ID") {
        return jsonError("errors.idInvalid");
      }
      return handleError(error);
    }
  });

export const PUT = withActiveElection(async (req, { params, election }) => {
  const body = await req.json();

  const updated = await db.personaOperativa.update({
    where: { id: Number(params!.id), eleccionId: election.id },
    data: {
      nombre: body.nombre.toUpperCase(),
      telefono: body.telefono,
      tipo: body.tipo,
    },
  });

  return NextResponse.json(updated);
});

export const DELETE = withActiveElection(async (req, { params, election }) => {  
  await db.personaOperativa.delete({
    where: { id: Number(params!.id), eleccionId: election.id },
  });

  return NextResponse.json({ ok: true });
});