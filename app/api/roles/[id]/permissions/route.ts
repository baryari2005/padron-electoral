import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rolId = parseInt(params.id);

    if (isNaN(rolId)) {
      return NextResponse.json(
        { error: "ID de rol inválido" },
        { status: 400 }
      );
    }

    const permisos = await db.permisoPorRol.findMany({
      where: { rolId },
      select: { permisoId: true },
    });

    const permisoIds = permisos.map((p) => p.permisoId);

    return NextResponse.json(permisoIds);
  } catch (error) {
    console.error("[GET /api/roles/:id/permissions]", error);
    return NextResponse.json(
      { error: "Error al obtener permisos del rol" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rolId = parseInt(params.id);

    if (isNaN(rolId)) {
      return NextResponse.json(
        { error: "ID de rol inválido" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { permisos } = body;

    if (!Array.isArray(permisos)) {
      return NextResponse.json(
        { error: "El campo 'permisos' debe ser un arreglo" },
        { status: 400 }
      );
    }

    // 🔄 Borramos los permisos anteriores
    await db.permisoPorRol.deleteMany({
      where: { rolId },
    });

    // ✅ Insertamos los nuevos
    const nuevosPermisos = permisos.map((permisoId: number) => ({
      rolId,
      permisoId,
    }));

    if (nuevosPermisos.length > 0) {
      await db.permisoPorRol.createMany({ data: nuevosPermisos });
    }

    return NextResponse.json({ message: "Permisos actualizados correctamente" });
  } catch (error) {
    console.error("[PUT /api/roles/:id/permissions]", error);
    return NextResponse.json(
      { error: "Error al actualizar los permisos" },
      { status: 500 }
    );
  }
}
