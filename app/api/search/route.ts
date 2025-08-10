// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // tu instancia de prisma

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "";

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const [ agrupaciones, circuitos, electores, establecimientos] = await Promise.all([
    // db.mesaEscrutada.findMany({
    //   where: { numero: { contains: query } },
    //   select: { id: true, numero: true },
    //   take: 5,
    // }),
    db.agrupacionPolitica.findMany({
        where: {
            OR: [ 
                {
                    nombre: { contains: query, mode: "insensitive" }   
                }
            ],
        },
        select: { id: true, numero: true, nombre: true },
        take: 5,
    }),
    db.circuito.findMany({
        where: {
            OR: [
                {
                    nombre: { contains: query, mode: "insensitive" }
                }
            ],
        },
        select: { id: true, codigo: true,  nombre: true },
        take: 5,
    }),
    db.padronElectoral.findMany({
      where: {
        OR: [
          { apellido: { contains: query, mode: "insensitive" } },
          { numeroMatricula: { contains: query } },
        ],
      },
      select: { id: true, apellido: true, nombre: true, numeroMatricula: true },
      take: 5,
    }),
    db.establecimiento.findMany({
      where: { nombre: { contains: query, mode: "insensitive" } },
      select: { id: true, nombre: true },
      take: 5,
    }),
  ]);

  const results = [
    // ...mesas.map((m) => ({
    //   type: "Mesa",
    //   label: `Mesa ${m.numero}`,
    //   id: m.id,
    // })),
    ...agrupaciones.map((a) => ({
      type: "Agrupación",
      label: `${a.numero} - ${a.nombre}`,
      id: a.id,
    })),
    ...circuitos.map((c) => ({
      type: "Circuito",
      label: `${c.codigo} - ${c.nombre}`,
      id: c.id,
    })),
    ...electores.map((e) => ({
      type: "Elector",
      label: `${e.apellido}, ${e.nombre} - DNI ${e.numeroMatricula}`,
      id: e.id,
    })),
    ...establecimientos.map((est) => ({
      type: "Escuela",
      label: est.nombre,
      id: est.id,
    })),
  ];

  return NextResponse.json({ results });
}
