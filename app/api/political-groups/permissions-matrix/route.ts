import { db } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  const url = new URL(req.url);
  const eleccionIdParam = url.searchParams.get("eleccionId");
  const eleccionId = eleccionIdParam ? Number(eleccionIdParam) : null;

  // Traemos reglas globales y/o específicas (si hay eleccionId)
  const rules = await db.agrupacionCargoPerm.findMany({
    where: {
      OR: eleccionId != null
        ? [{ eleccionId }, { eleccionId: null }]
        : [{ eleccionId: null }],
    },
    select: { agrupacionId: true, cargoId: true, eleccionId: true, allowed: true },
    orderBy: [
      { agrupacionId: "asc" },
      { cargoId: "asc" },
      // Truco: queremos priorizar específica sobre global -> eleccionId DESC
      { eleccionId: "desc" },
    ],
  });

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
}
