import { withActiveElection } from "@/lib/_server/withActiveElection";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";


export const GET = withActiveElection(async (req, { election }) => {
  const url = new URL(req.url);
  //const eleccionIdParam = url.searchParams.get("eleccionId");
  //const eleccionId = eleccionIdParam ? Number(eleccionIdParam) : null;

  //console.log("Parametro", eleccionIdParam);
  //console.log("EleccionId", eleccionId);

  // Traemos reglas globales y/o específicas (si hay eleccionId)

  let where: Prisma.AgrupacionCargoPermWhereInput = {
    eleccionId: election.id
  }
  
  const rules = await db.agrupacionCargoPerm.findMany({
    where,
    select: { agrupacionId: true, cargoId: true, eleccionId: true, allowed: true },
    orderBy: [
      { agrupacionId: "asc" },
      { cargoId: "asc" },
      // Truco: queremos priorizar específica sobre global -> eleccionId DESC
      { eleccionId: "desc" },
    ],
  });

  console.log(rules);

  // Reducimos: para cada (agrupacionId, cargoId) quedarnos con la 1ra (específica si existe)
  const seen = new Set<string>();
  const byGroup: Record<number, number[]> = {};

  for (const r of rules) {
    const key = `${r.agrupacionId}:${r.cargoId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!r.allowed) continue;

    if (!byGroup[r.agrupacionId]) byGroup[r.agrupacionId] = [];
    byGroup[r.agrupacionId].push(r.cargoId);
  }

  return NextResponse.json({ byGroup });
});
