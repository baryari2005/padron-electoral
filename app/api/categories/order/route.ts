export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { withActiveElection } from "@/lib/_server/withActiveElection";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const GET = withActiveElection(async (req, { election }) => {
  const cargos = await db.cargoPolitico.findMany({
    where: {
      eleccionId: election.id,
      deletedAt: null,
    },
    select: {
      nombre: true,
      orden: true,
    },
    orderBy: [{ orden: "asc" }, { id: "asc" }],
  });

  return NextResponse.json(
    cargos.map((c) => c.nombre.toUpperCase())
  );
});