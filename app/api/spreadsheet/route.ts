// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { assertInternalElection } from "@/lib/elections/assertInternalElection";

// export async function GET() {
//   const election = await assertInternalElection();

//   const planillas = await db.planilla.findMany({
//     where: { eleccionId: election.id },
//     orderBy: { numero: "asc" },
//   });

//   return NextResponse.json(planillas);
// }

// export async function POST(req: Request) {
//   const election = await assertInternalElection();
//   const body = await req.json();

//   const nueva = await db.planilla.create({
//     data: {
//       numero: body.numero,
//       eleccionId: election.id,
//     },
//   });

//   return NextResponse.json(nueva);
// }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { formatApiMessage } from "@/lib/utils/formatters";
import { handleError } from "@/lib/utils/request-helpers";

import { getPagination } from "@/lib/_server/pagination";
import { mergeAndWhere } from "@/lib/_server/helper.service";
import { withActiveElection } from "@/lib/_server/withActiveElection";
import { buildOrderBy, buildPlanillaWhere, createSpreadsheet, findByNumberOrNameInsensitive } from "@/lib/_server/spreadsheet.service";


export const GET = withActiveElection(async (req, { election }) => {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, skip } = getPagination(searchParams, 1, 10, 100);

    const search = searchParams.get("search") || "";
    const all = searchParams.get("all") === "true";

    const sortBy = searchParams.get("sortBy");
    const sortDir = (searchParams.get("sortDir") === "desc" ? "desc" : "asc") as
      | "asc"
      | "desc";

    const orderBy = buildOrderBy(sortBy, sortDir);

    let where: Prisma.PlanillaWhereInput = {
      eleccionId: election.id,      
    };

    where = mergeAndWhere(where,  buildPlanillaWhere(search));
    
    if (all) {
      const items = await db.planilla.findMany({
        where,
        orderBy,
      });

      return NextResponse.json({ items, total: items.length });
    }

    const [items, total] = await Promise.all([
      db.planilla.findMany({
        where,
        skip,
        take: limit,
        orderBy,        
      }),
      db.planilla.count({ where }),
    ]);

    return NextResponse.json({ items, total });

  } catch (error) {
    return handleError(error);
  }
});

export const POST = withActiveElection(async (req, { election }) => {
  try {    
    const {numero, nombre} = await req.json();

    if (!numero) {
      return NextResponse.json(
        { error: formatApiMessage("required.number") },
        { status: 400 }
      );
    }

    if (!nombre) {
      return NextResponse.json(
        { error: formatApiMessage("required.name") },
        { status: 400 }
      );
    }

    // Unicidad: @@unique([numero, eleccionId])
    const existing = await findByNumberOrNameInsensitive(numero, nombre, election.id);  
    if (existing) {
      return NextResponse.json(
        { error: formatApiMessage("errors.spreadsheetExists") },
        { status: 400 }
      );
    }

    const created = await createSpreadsheet({
      numero: String(numero),
      nombre,
      eleccionId: election.id,
    });

    return NextResponse.json(created, { status: 201 });


  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: formatApiMessage("errors.spreadsheetExists") },
        { status: 400 }
      );
    }

    return handleError(error);
  }
});