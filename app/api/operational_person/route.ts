import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertInternalElection } from "@/lib/elections/assertInternalElection";
import { Prisma } from '@prisma/client';
import { getPagination } from "@/lib/_server/pagination";
import { mergeAndWhere } from "@/lib/_server/helper.service";
import { withActiveElection } from "@/lib/_server/withActiveElection";


function SearchWhere(search: string): Prisma.PersonaOperativaWhereInput {
  const terms = search.trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return {};

  return {
    AND: [
      {
        OR: terms.map((term) => ({
          nombre: { contains: term, mode: Prisma.QueryMode.insensitive },
        })),
      },
      {
        nombre: { contains: search, mode: Prisma.QueryMode.insensitive },
      },
    ],
  };
}

function buildOrderBy(
  sortBy?: string | null,
  sortDir: "asc" | "desc" = "asc"
): Prisma.PersonaOperativaOrderByWithRelationInput {
  switch (sortBy) {
    case "nombre":
      return { nombre: sortDir };
    case "tipo":
      return { tipo: sortDir };
    default:
      return { nombre: "asc" }; // orden por defecto
  }
}

export const GET = withActiveElection(async (req, { election }) => {  
  const { searchParams } = new URL(req.url);
  const { page, limit, skip } = getPagination(searchParams, 1, 10, 100);

  const search = searchParams.get("search") || "";
  const all = searchParams.get("all") === "true";

  const sortBy = searchParams.get("sortBy");
  const sortDir = (searchParams.get("sortDir") === "desc" ? "desc" : "asc") as
    | "asc"
    | "desc";

  const orderBy = buildOrderBy(sortBy, sortDir);


  let where: Prisma.PersonaOperativaWhereInput = { eleccionId: election.id };
  where = mergeAndWhere(where, SearchWhere(search));

  if (all) {
    const items = await db.personaOperativa.findMany({
      where: { eleccionId: election.id },
      orderBy,
    });
    return NextResponse.json({ items, total: items.length });
  }

  const [items, total] = await Promise.all([
    db.personaOperativa.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    db.personaOperativa.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
});

export const POST = withActiveElection(async (req, { election }) => {  
  const body = await req.json();

  const nueva = await db.personaOperativa.create({
    data: {
      nombre: body.nombre.toUpperCase(),
      telefono: body.telefono ?? null,
      tipo: body.tipo, // REFERENTE | PLANILLERO | CHOFER
      eleccionId: election.id,
    },
  });

  return NextResponse.json(nueva);
});