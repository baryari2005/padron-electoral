export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { getById, softDelete, update } from "@/lib/_server/political-group.service";
import { withActiveElection } from "@/lib/_server/withActiveElection";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";
import { jsonError, parseIdOrThrow } from "@/lib/utils/api-helpers";
import { formatApiMessage } from "@/lib/utils/formatters";
import { handleError } from "@/lib/utils/request-helpers";
import { NextRequest, NextResponse } from "next/server";

export const GET = withActiveElection(
  async (req, { params, election }) => {
    try {
      const agrupacion = await getById(parseIdOrThrow(params!.id), election.id);

      if (!agrupacion)
        return jsonError("errors.politicalGroupNotFound", 404);

      return NextResponse.json({
        cargoIds: agrupacion.AgrupacionCargoPerm.map(p => p.cargoId),
        ...agrupacion
      });
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_ID")
        return jsonError("errors.idInvalid");

      return handleError(error);
    }
  });

export const PUT = withActiveElection(async (req, { params, election }) => {
  try {
    const userId = getUserIdFromRequest(req);
    const id = parseIdOrThrow(params!.id);

    const { nombre, numero, profileImage, color_hex, orden, cargoIds } = await req.json();

    if (!nombre) return jsonError("required.name");
    if (!numero) return jsonError("required.number");

    const updated =
      await update(id, { nombre, numero, profileImage, color_hex, orden, userId, cargoIds, eleccionId: election.id });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") 
      return jsonError("errors.idInvalid");

    return handleError(error);
  }
});

// DELETE: borrado lógico
export const DELETE = withActiveElection(async (req, { params, election }) => {
  try {
    const userId = getUserIdFromRequest(req);
    const id = parseIdOrThrow(params!.id);

    await softDelete(id, userId || undefined);
    return NextResponse.json({ message: formatApiMessage("success.politicalGroupDeleted") });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") return jsonError("errors.idInvalid");
    return handleError(error);
  }
});