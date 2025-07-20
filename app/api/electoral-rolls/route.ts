import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { electoralRollSchema } from "@/app/(dashboard)/electoral-rolls/lib";
import { Prisma } from "@prisma/client";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const localidad = searchParams.get("localidad") || undefined;
  const circuitoId = searchParams.get("circuitoId") || undefined;
  const establecimientoId = searchParams.get("establecimientoId") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const terms = search.trim().split(" ").filter(Boolean);
  const part1 = terms[0] ?? "";
  const part2 = terms[1] ?? "";

  try {
    const where = {
      AND: [
        {
          OR: [
            { numero_matricula: { contains: search } },
            { apellido: { startsWith: search, mode: Prisma.QueryMode.insensitive } },
            { nombre: { startsWith: search, mode: Prisma.QueryMode.insensitive } },
            {
              AND: [
                { apellido: { contains: part1, mode: Prisma.QueryMode.insensitive } },
                { nombre: { contains: part2, mode: Prisma.QueryMode.insensitive } },
              ],
            },
            {
              AND: [
                { nombre: { contains: part1, mode: Prisma.QueryMode.insensitive } },
                { apellido: { contains: part2, mode: Prisma.QueryMode.insensitive } },
              ],
            },
          ],
        },
        localidad ? { localidad } : {},
        circuitoId ? { circuitoId: Number(circuitoId) } : {},
        establecimientoId ? { establecimientoId: Number(establecimientoId) } : {},
      ],
    };


    const [padron, total] = await Promise.all([
      db.padronElectoral.findMany({
        where,
        include: {
          establecimiento: true,
          circuito: true,
        },
        skip,
        take: limit,
      }),
      db.padronElectoral.count({ where }),
    ]);

    return NextResponse.json({ padron, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener el padrón" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = electoralRollSchema.parse(body);

    const created = await db.padronElectoral.create({
      data,
    });

    return NextResponse.json(created);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message || "Error al crear el registro" },
      { status: 500 }
    );
  }
}
