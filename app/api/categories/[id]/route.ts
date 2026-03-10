export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";
import { jsonError, parseIdOrThrow } from "@/lib/utils/api-helpers";
import { formatApiMessage } from "@/lib/utils/formatters";
import { handleError } from "@/lib/utils/request-helpers";
import { getCargoPoliticoById, softDeleteCargoPolitico, updateCargoPolitico } from "@/lib/_server/categories.service";
import { withActiveElection } from "@/lib/_server/withActiveElection";


export const GET = withActiveElection(
  async (req, { params, election }) => {
    try {
      const id = parseIdOrThrow(params!.id);

      const cargo = await getCargoPoliticoById(id, election.id);

      if (!cargo) return jsonError("errors.categoryNotFound", 404);
      return NextResponse.json(cargo);
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_ID") {
        return jsonError("errors.idInvalid");
      }
      return handleError(error);
    }
  });

// PUT: actualizar nombre
export const PUT = withActiveElection(async (req, { params, election }) => {
  try {
    const userId = getUserIdFromRequest(req);
    const id = parseIdOrThrow(params!.id);  
    const { nombre, orden } = await req.json();

    if (!nombre) return jsonError("required.name");

    const updated = await updateCargoPolitico({ id, nombre, orden, userId, eleccionId: election.id });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.message === "INVALID_ID") {
      return jsonError("errors.idInvalid");
    }
    return handleError(error);
  }
});

// DELETE: borrado lógico
export const DELETE = withActiveElection(async (req, { params, election }) => {
  try {
    const userId = getUserIdFromRequest(req);
    const id = parseIdOrThrow(params!.id);
    
    await softDeleteCargoPolitico(id, election.id, userId || undefined);
    return NextResponse.json({ message: formatApiMessage("success.categoryDeleted") });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.message === "INVALID_ID") {
      return jsonError("errors.idInvalid");
    }
    return handleError(error);
  }
});
