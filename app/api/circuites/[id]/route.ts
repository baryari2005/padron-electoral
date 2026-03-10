export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import {
  getCircuitoById,
  softDeleteCircuito,
  updateCircuito,
} from "@/lib/_server/circuites.service";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";
import { jsonError, parseIdOrThrow } from "@/lib/utils/api-helpers";
import { formatApiMessage } from "@/lib/utils/formatters";
import { handleError } from "@/lib/utils/request-helpers";
import { withActiveElection } from "@/lib/_server/withActiveElection";

export const GET = withActiveElection(
  async (req, { params, election }) => {
    try {
      const id = parseIdOrThrow(params!.id);

      const circuito = await getCircuitoById(id, election.id);

      if (!circuito) {
        return jsonError("errors.circuiteNotFound", 404);
      }

      return NextResponse.json(circuito);
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_ID") {
        return jsonError("errors.idInvalid");
      }

      return handleError(error);
    }
  }
);

export const PUT = withActiveElection(async (req, { params, election }) => {
    try {
      const userId = getUserIdFromRequest(req);
      const id = parseIdOrThrow(params!.id);

      const { nombre, codigo } = await req.json();

      if (!nombre) return jsonError("required.name");
      if (!codigo) return jsonError("required.code");

      const updated = await updateCircuito({
        id,
        nombre,
        codigo,
        userId,
        eleccionId: election.id,
      });

      return NextResponse.json(updated);
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_ID") {
        return jsonError("errors.idInvalid");
      }

      return handleError(error);
    }
  }
);

export const DELETE = withActiveElection(async (req, { params, election }) => {
    try {
      const userId = getUserIdFromRequest(req);
      const id = parseIdOrThrow(params!.id);

      await softDeleteCircuito(id, election.id, userId || undefined);

      return NextResponse.json({
        message: formatApiMessage("success.circuiteDeleted"),
      });
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_ID") {
        return jsonError("errors.idInvalid");
      }

      return handleError(error);
    }
  }
);

