import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { electoralRollSchema } from "@/app/(dashboard)/electoral-rolls/lib";
import { Prisma } from "@prisma/client";
import { checkUserRole } from "@/lib/auth/checkUserRole";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const localidad = searchParams.get("localidad") || undefined;
  const circuitoId = searchParams.get("circuitoId") || undefined;
  const establecimientoId = searchParams.get("establecimientoId") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;


  // Tratamos "__all__" como "sin filtro"
  const localidadFilter = localidad && localidad !== "__all__" ? localidad : undefined;
  const circuitoFilter = circuitoId && circuitoId !== "__all__" ? Number(circuitoId) : undefined;
  const establecimientoFilter = establecimientoId && establecimientoId !== "__all__" ? Number(establecimientoId) : undefined;

  const terms = search.trim().split(/\s+/).filter(Boolean);

  try {
    const where: Prisma.PadronElectoralWhereInput = {
      AND: [
        {
          OR: [
            { numeroMatricula: { contains: search } },
            ...terms.map((term) => ({
              apellido: { contains: term, mode: Prisma.QueryMode.insensitive },
            })),
            ...terms.map((term) => ({
              nombre: { contains: term, mode: Prisma.QueryMode.insensitive },
            })),
            ...(terms.length >= 2
              ? [
                {
                  AND: [
                    {
                      apellido: {
                        contains: terms[0],
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                    {
                      nombre: {
                        contains: terms[1],
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                  ],
                },
                {
                  AND: [
                    {
                      nombre: {
                        contains: terms[0],
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                    {
                      apellido: {
                        contains: terms[1],
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                  ],
                },
              ]
              : []),
          ],
        },
        ...(localidadFilter ? [{ localidad: localidadFilter }] : []),
        ...(circuitoFilter ? [{ circuitoId: circuitoFilter }] : []),
        ...(establecimientoFilter ? [{ establecimientoId: establecimientoFilter }] : []),
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

    return NextResponse.json({ items: padron, total });
  } catch (error) {
    // console.error(error);
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

    const user = await checkUserRole(req, ["ADMINISTRADOR", "CARGADOR"]);

    const created = await db.padronElectoral.create({
      data: {
        ...data,
        userId: user.userId,
      },
    });

    return NextResponse.json(created);
  } catch (error: any) {
    // console.error(error);
    return NextResponse.json(
      { error: error?.message || "Error al crear el registro" },
      { status: 500 }
    );
  }
}
