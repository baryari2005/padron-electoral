// import { assertInternalElection } from "@/lib/elections/assertInternalElection";
// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";

// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   await assertInternalElection();
//   const body = await req.json();

//   const updated = await db.planilla.update({
//     where: { id: Number(params.id) },
//     data: {
//       numero: body.numero,      
//     },
//   });

//   return NextResponse.json(updated);
// }

// export async function DELETE(
//   _req: Request,
//   { params }: { params: { id: string } }
// ) {
//   await assertInternalElection();

//   await db.planilla.delete({
//     where: { id: Number(params.id) },
//   });

//   return NextResponse.json({ ok: true });
// }

// app/api/spreadsheet/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleError } from "@/lib/utils/request-helpers";
import { withActiveElection } from "@/lib/_server/withActiveElection";
import { jsonError, parseIdOrThrow } from "@/lib/utils/api-helpers";
import { deleteSpreadsheet, getSpreadsheetById, updateSpreadsheet } from "@/lib/_server/spreadsheet.service";
import { formatApiMessage } from "@/lib/utils/formatters";

export const GET = withActiveElection(async (_req, { election, params }) => {
  try {
    const id = parseIdOrThrow(params!.id);

    const spreadsheet = await getSpreadsheetById(id, election.id);

    if (!spreadsheet) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    return NextResponse.json(spreadsheet);
  } catch (e) {
    return handleError(e);
  }
});

export const PUT = withActiveElection(async (req, { election, params }) => {
  try {
    const id = parseIdOrThrow(params!.id);

    const { nombre, numero } = await req.json();

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
    }

    const updated = await updateSpreadsheet({
      id,
      nombre,
      numero,
      eleccionId: election.id
    })

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") {
      return jsonError("errors.idInvalid");
    }

    return handleError(error);
  }
});

export const DELETE = withActiveElection(async (req, { params, election }) => {
    try {      
      const id = parseIdOrThrow(params!.id);

      await deleteSpreadsheet(id, election.id);

      return NextResponse.json({
        message: formatApiMessage("success.spreadsheetDeleted"),
      });
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_ID") {
        return jsonError("errors.idInvalid");
      }

      return handleError(error);
    }
  }
);
