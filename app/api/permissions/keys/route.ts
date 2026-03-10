export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";
import { formatApiMessage } from "@/lib/utils/formatters";
import { handleError } from "@/lib/utils/request-helpers";

type Accion = "ver" | "crear" | "editar" | "eliminar";

type PermisoAccion = {
  id: string | number;
  clave: string;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const all = searchParams.get("all") === "true"; // ← Agregado
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const terms = search.trim().split(/\s+/).filter(Boolean);

    let where: Prisma.PermisoWhereInput = { deletedAt: null };

    if (terms.length > 0) {
      where = {
        AND: [
          { deletedAt: null },
          {
            OR: terms.map((term) => ({
              modulo: {
                contains: term,
                mode: Prisma.QueryMode.insensitive,
              },
            })),
          },
          {
            modulo: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      };
    }

    console.log("where", where);
    // Si viene `all=true`, devolvemos todo sin paginar
    if (all) {
      const items = await db.permiso.findMany({
        where,
        orderBy: { modulo: "asc" },
      });

      return NextResponse.json({ items, total: items.length });
    }

    // Paginado normal
    const [items, total] = await Promise.all([
      db.permiso.findMany({
        where,
        skip,
        take: limit,
        orderBy: { modulo: "asc" },
      }),
      db.permiso.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener permisos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { clave, descripcion, modulo, accion } = await req.json();
    const userId = getUserIdFromRequest(req);

    if (!clave)
      return NextResponse.json(
        { error: formatApiMessage("required.name") },
        { status: 400 }
      );

    if (!descripcion)
      return NextResponse.json(
        { error: formatApiMessage("required.code") },
        { status: 400 }
      );

    if (!modulo)
      return NextResponse.json(
        { error: formatApiMessage("required.code") },
        { status: 400 }
      );

    if (!accion)
      return NextResponse.json(
        { error: formatApiMessage("required.code") },
        { status: 400 }
      );

    const existing = await db.permiso.findUnique({
      where: { clave },
    });

    if (existing) {
      if (existing.deletedAt !== null) {
        const reactivated = await db.permiso.update({
          where: { id: existing.id },
          data: {
            descripcion,
            modulo,
            accion,
            deletedAt: null,
          },
        });

        return NextResponse.json(reactivated, { status: 200 });
      }

      return NextResponse.json(
        { error: formatApiMessage("errors.permissionKeyExists") },
        { status: 400 }
      );
    }

    const permiso = await db.permiso.create({
      data: {
        clave,
        descripcion,
        modulo,
        accion,
      },
    });

    return NextResponse.json(permiso, { status: 201 });
  } catch (error: any) {
    return handleError(error);
  }
}
