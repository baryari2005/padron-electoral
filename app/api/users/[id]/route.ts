export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { checkUserRole } from "@/lib/auth/checkUserRole";

// ===================== GET /api/users/[id] =====================
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let userId: string;

  try {
    userId = (await checkUserRole(req, ["ADMINISTRADOR", "CARGADOR"])).userId;
  } catch (err) {
    return new NextResponse((err as Response).statusText, {
      status: (err as Response).status,
    });
  }

  try {
    // Verificamos el rol del usuario autenticado
    const loggedUser = await db.usuario.findUnique({
      where: { id: userId },
      include: { rol: true },
    });

    if (!loggedUser) {
      return NextResponse.json(
        { error: "Usuario autenticado no encontrado" },
        { status: 401 }
      );
    }

    const isAdmin = loggedUser.rol?.nombre === "ADMINISTRADOR";

    // Si no es admin, solo puede leer(se) a sí mismo
    if (!isAdmin && userId !== params.id) {
      return NextResponse.json(
        { error: "No autorizado para editar este usuario" },
        { status: 403 }
      );
    }

    const user = await db.usuario.findFirst({
      where: { id: params.id },
      include: {
        rol: true,
        escuelas: { select: { establecimientoId: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const escuelasIds = user.escuelas.map((u) => u.establecimientoId);

    // Sanitizamos: no devolver password ni arreglo 'escuelas'
    const { password, escuelas, ...userSafe } = user;

    return NextResponse.json({ ...userSafe, escuelasIds }, { status: 200 });
  } catch (err) {
    console.error("[GET USER ERROR]", err);
    return NextResponse.json(
      { error: "Error al buscar el usuario" },
      { status: 500 }
    );
  }
}

// ===================== PUT /api/users/[id] =====================
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let userId: string;

  try {
    userId = (await checkUserRole(req, ["ADMINISTRADOR", "CARGADOR"])).userId;
  } catch (err) {
    return new NextResponse((err as Response).statusText, {
      status: (err as Response).status,
    });
  }

  try {
    // Verificamos el rol del usuario autenticado
    const loggedUser = await db.usuario.findUnique({
      where: { id: userId },
      include: { rol: true },
    });

    if (!loggedUser) {
      return NextResponse.json(
        { error: "Usuario autenticado no encontrado" },
        { status: 401 }
      );
    }

    const isAdmin = loggedUser.rol?.nombre === "ADMINISTRADOR";

    // Si no es admin, solo puede modificarse a sí mismo
    if (!isAdmin && userId !== params.id) {
      return NextResponse.json(
        { error: "No autorizado para eliminar este usuario" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      nombre,
      apellido,
      email,
      rolId,
      avatarUrl,
      password,
      escuelasIds,
    } = body as {
      nombre?: string;
      apellido?: string;
      email?: string;
      rolId?: number;
      avatarUrl?: string;
      password?: string;
      escuelasIds?: number[];
    };

    await db.$transaction(async (tx) => {
      const dataToUpdate: any = {
        email,
        nombre,
        apellido,
        avatarUrl,
        rolId,
      };

      if (password && password.trim() !== "") {
        dataToUpdate.password = await hash(password, 10);
      }

      // 1) Usuario
      await tx.usuario.update({
        where: { id: params.id },
        data: dataToUpdate,
      });

      // 2) Relaciones con establecimientos (sync simple: borrar y crear)
      if (Array.isArray(escuelasIds)) {
        await tx.usuarioEstablecimiento.deleteMany({
          where: { usuarioId: params.id },
        });

        if (escuelasIds.length > 0) {
          await tx.usuarioEstablecimiento.createMany({
            data: escuelasIds.map((establecimientoId: number) => ({
              usuarioId: params.id,
              establecimientoId,
            })),
            skipDuplicates: true,
          });
        }
      }
    });

    return NextResponse.json(
      { message: "Usuario modificado correctamente" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[UPDATE USER ERROR]", err);
    return NextResponse.json(
      { error: "Error al modificar el usuario" },
      { status: 500 }
    );
  }
}

// ===================== DELETE /api/users/[id] =====================
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let userId: string;

  try {
    userId = (await checkUserRole(req, ["ADMINISTRADOR", "CARGADOR"])).userId;
  } catch (err) {
    return new NextResponse((err as Response).statusText, {
      status: (err as Response).status,
    });
  }

  try {
    const loggedUser = await db.usuario.findUnique({
      where: { id: userId },
      include: { rol: true },
    });

    if (!loggedUser) {
      return NextResponse.json(
        { error: "Usuario autenticado no encontrado" },
        { status: 401 }
      );
    }

    const isAdmin = loggedUser.rol?.nombre === "ADMINISTRADOR";

    // Si no es admin, solo puede borrarse a sí mismo
    if (!isAdmin && userId !== params.id) {
      return NextResponse.json(
        { error: "No autorizado para eliminar este usuario" },
        { status: 403 }
      );
    }

    await db.usuario.delete({
      where: { id: params.id },
    });

    // No hace falta deleteMany de relaciones por el onDelete: Cascade en UsuarioEstablecimiento

    return NextResponse.json(
      { message: "Usuario eliminado correctamente" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[DELETE USER ERROR]", err);
    return NextResponse.json(
      { error: "Error al eliminar el usuario" },
      { status: 500 }
    );
  }
}
