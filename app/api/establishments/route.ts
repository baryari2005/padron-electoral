import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { formatApiMessage } from "@/lib/utils/formatters";
import { handleError } from "@/lib/utils/request-helpers";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";

// GET: obtener todos los establecimientos (con o sin paginación)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const noPagination = searchParams.get("all") === "true";
    const search = searchParams.get("search") || "";
    const all = searchParams.get("all") === "true"; // ← Agregado
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const terms = search.trim().split(/\s+/).filter(Boolean);

    let where: Prisma.EstablecimientoWhereInput = { deletedAt: null };

    if (terms.length > 0) {
      where.AND = terms.map((term) => ({
        OR: [
          { nombre: { contains: term, mode: "insensitive" } },
          { direccion: { contains: term, mode: "insensitive" } },
          { circuito: { nombre: { contains: term, mode: "insensitive" } } },
        ],
      }));
    }

    // Si viene `all=true`, devolvemos todo sin paginar
    if (all) {
      const items = await db.establecimiento.findMany({
        where,
        include: { circuito: true, mesasPorEstablecimiento: true, },
        orderBy: { nombre: "asc" },
      });

      return NextResponse.json({ items, total: items.length });
    }

    const queryOptions: Prisma.EstablecimientoFindManyArgs = {
      where,
      include: { circuito: true, mesasPorEstablecimiento: true, },
      orderBy: { nombre: "asc" },
    };

    if (!noPagination) {
      queryOptions.skip = skip;
      queryOptions.take = limit;
    }

    const [items, total] = await Promise.all([
      db.establecimiento.findMany(queryOptions),
      db.establecimiento.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    return handleError(error);
  }
}

// POST: crear un establecimiento
export async function POST(req: NextRequest) {
  try {
    const { nombre, direccion, profileImage, circuitoId, numeroDeMesa } = await req.json();
    const userId = getUserIdFromRequest(req);

    if (!nombre || !direccion || !circuitoId) {
      return NextResponse.json({ error: formatApiMessage("required.fields") }, { status: 400 });
    }

    const finalProfileImage =
      profileImage?.trim() ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=adf5d7&color=000&size=128&rounded=true&bold=true`;


    const data: Prisma.EstablecimientoCreateInput = {
      nombre,
      direccion,
      profileImage: finalProfileImage,
      circuito: { connect: { id: circuitoId } },
      userId,
      ...(Array.isArray(numeroDeMesa) && numeroDeMesa.length > 0
        ? {
          mesasPorEstablecimiento: {
            create: numeroDeMesa.map((numero) => ({ numero, userId, })),
          },
        }
        : {}),
    };

    const created = await db.establecimiento.create({ data });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: formatApiMessage("errors.establishmentExists") },
        { status: 400 }
      );
    }

    return handleError(error);
  }
}
