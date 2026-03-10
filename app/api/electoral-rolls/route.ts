export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { electoralRollSchema } from "@/app/(dashboard)/electoral-rolls/lib";
import { Prisma } from "@prisma/client";
import { checkUserRole } from "@/lib/auth/checkUserRole";
import { withActiveElection } from "@/lib/_server/withActiveElection";

export const GET = withActiveElection(async (req, { election }) => {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const localidad = searchParams.get("localidad") || undefined;
    const circuitoId = searchParams.get("circuitoId") || undefined;
    const establecimientoId = searchParams.get("establecimientoId") || undefined;
    const referenteId = searchParams.get("referenteId") || undefined;
    const planilleroId = searchParams.get("planilleroId") || undefined;
    const choferId = searchParams.get("choferId") || undefined;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const localidadFilter =
      localidad && localidad !== "__all__" ? localidad : undefined;

    const circuitoFilter =
      circuitoId && circuitoId !== "__all__"
        ? Number(circuitoId)
        : undefined;

    const establecimientoFilter =
      establecimientoId && establecimientoId !== "__all__"
        ? Number(establecimientoId)
        : undefined;

    const referenteFilter =
      referenteId && referenteId !== "__all__"
        ? Number(referenteId)
        : undefined;

    const planilleroFilter =
      planilleroId && planilleroId !== "__all__"
        ? Number(planilleroId)
        : undefined;

    const choferFilter =
      choferId && choferId !== "__all__"
        ? Number(choferId)
        : undefined;

    const terms = search.trim().split(/\s+/).filter(Boolean);

    const searchBlock: Prisma.PadronElectoralWhereInput = {
      OR: [
        { numeroMatricula: { contains: search } },
        ...terms.map((term) => ({
          apellido: {
            contains: term,
            mode: Prisma.QueryMode.insensitive,
          },
        })),
        ...terms.map((term) => ({
          nombre: {
            contains: term,
            mode: Prisma.QueryMode.insensitive,
          },
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
    };

    const filters: Prisma.PadronElectoralWhereInput[] = [];

    if (localidadFilter) filters.push({ localidad: localidadFilter });
    if (circuitoFilter) filters.push({ circuitoId: circuitoFilter });
    if (establecimientoFilter)
      filters.push({ establecimientoId: establecimientoFilter });
    if (referenteFilter) filters.push({ referenteId: referenteFilter });
    if (planilleroFilter) filters.push({ planilleroId: planilleroFilter });
    if (choferFilter) filters.push({ choferId: choferFilter });

    const where: Prisma.PadronElectoralWhereInput = {
      AND: [
        { eleccionId: election.id }, 
        searchBlock, 
        ...filters
      ],
    };

    const [items, total] = await Promise.all([
      db.padronElectoral.findMany({
        where,
        include: {
          establecimiento: true,
          circuito: true,
          referente: true,
          planillero: true,
          chofer: true,
          planilla: true,
        },
        skip,
        take: limit,
        orderBy: { apellido: "asc" },
      }),
      db.padronElectoral.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener el padrón" },
      { status: 500 }
    );
  }
});

export const POST = withActiveElection(async (req, { election }) => {
  try {
    const body = await req.json();
    const data = electoralRollSchema.parse(body);

    const user = await checkUserRole(req, [
      "ADMINISTRADOR",
      "CARGADOR",
    ]);

    const created = await db.padronElectoral.create({
      data: {
        ...data,
        userId: user.userId,
        eleccionId: election.id
      },
    });

    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error al crear el registro" },
      { status: 500 }
    );
  }
});