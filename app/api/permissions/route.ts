import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

type Accion = "ver" | "crear" | "editar" | "eliminar";

type PermisoAccion = {
  id: string | number;
  clave: string;
};

export async function GET() {
  try {
    let where: Prisma.PermisoWhereInput = {deletedAt: null};

    const permisos = await db.permiso.findMany({
      where,
      orderBy: [{ modulo: "asc" }, { accion: "asc" }],
    });

    const agrupados: Record<string, Partial<Record<Accion, PermisoAccion>>> = {};

    const posiblesAcciones: Accion[] = ["ver", "crear", "editar", "eliminar"];

    for (const permiso of permisos) {
      const { modulo, accion, id, clave } = permiso;
      const moduloKey = String(modulo);

      if (!agrupados[moduloKey]) {
        agrupados[moduloKey] = {};
      }

      if (posiblesAcciones.includes(accion as Accion)) {
        agrupados[moduloKey][accion as Accion] = { id, clave };
      }
    }

    const resultado = Object.entries(agrupados).map(([modulo, acciones]) => ({
      modulo,
      acciones,
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("[GET /api/permisos]", error);
    return NextResponse.json({ error: "Error al obtener permisos" }, { status: 500 });
  }
}
