// app/api/establishments/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { handleError } from "@/lib/utils/request-helpers";
import { formatApiMessage } from "@/lib/utils/formatters";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";
import {
  buildEstablecimientoWhere,
  buildOrderBy,
  create as createEstab,
  findByNombreInsensitive,
} from "@/lib/_server/establishments.service";

/** GET: listado con search/paginación/orden */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const all = searchParams.get("all") === "true";

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const sortBy = searchParams.get("sortBy"); // "nombre" | "direccion" | "circuitoCodigo"
    const sortDir = (searchParams.get("sortDir") === "desc" ? "desc" : "asc") as "asc" | "desc";
    const orderBy = buildOrderBy(sortBy, sortDir);

    const where = buildEstablecimientoWhere(search);

    if (all) {
      const items = await db.establecimiento.findMany({
        where,
        orderBy,
        include: { circuito: true, mesasPorEstablecimiento: true },
      });
      return NextResponse.json({ items, total: items.length });
    }

    const [items, total] = await Promise.all([
      db.establecimiento.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { circuito: true, mesasPorEstablecimiento: true },
      }),
      db.establecimiento.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    return handleError(error);
  }
}

/** POST: crear establecimiento (+ mesas) */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, direccion, profileImage, circuitoId } = body as {
      nombre: string;
      direccion: string;
      profileImage?: string | null;
      circuitoId: number;
      numerosDeMesa?: number[]; // si lo mandás acá
    };

    const userId = getUserIdFromRequest(req);

    if (!nombre) return NextResponse.json({ error: formatApiMessage("required.name") }, { status: 400 });
    if (!direccion) return NextResponse.json({ error: formatApiMessage("required.street") }, { status: 400 });
    if (!circuitoId) return NextResponse.json({ error: formatApiMessage("required.circuite") }, { status: 400 });

    const finalProfileImage =
      (profileImage && profileImage.trim()) ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        nombre
      )}&background=adf5d7&color=000&size=128&rounded=true&bold=true&format=png`;

    // (opcional) validación: no duplicar por nombre (insensitive)
    const existing = await findByNombreInsensitive(nombre);
    if (existing && !existing.deletedAt) {
      return NextResponse.json({ error: formatApiMessage("errors.establishmentExists") }, { status: 400 });
    }

    const created = await createEstab({
      nombre,
      direccion,
      profileImage: finalProfileImage,
      circuitoId: Number(circuitoId),
      numerosDeMesa: Array.isArray(body.numerosDeMesa) ? body.numerosDeMesa : undefined,
      userId,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: formatApiMessage("errors.establishmentExists") },
        { status: 400 }
      );
    }
    return handleError(error);
  }
}
