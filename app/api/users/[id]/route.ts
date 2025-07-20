import { db } from "@/lib/db";
import { getAuthOrThrow } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthOrThrow(req);
    const loggedUserId = auth.userId;

    // Obtenemos el usuario logueado para verificar su rol
    const loggedUser = await db.user.findUnique({
      where: { id: loggedUserId },
      include: { role: true }, // Traemos el rol asociado
    });

    if (!loggedUser) {
      return NextResponse.json(
        { error: "Usuario autenticado no encontrado" },
        { status: 401 }
      );
    }

    const isAdmin = loggedUser.role?.name === "ADMINISTRADOR";

    // ✅ Si no es admin, solo puede eliminarse a sí mismo
    if (!isAdmin && loggedUserId !== params.id) {
      return NextResponse.json(
        { error: "No autorizado para editar este usuario" },
        { status: 403 }
      );
    }

    const user = await db.user.findFirst({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("[GET USER ERROR]", err);
    return NextResponse.json(
      { error: "Error al buscar el usuario" },
      { status: 500 }
    );
  }
}

// Actualizar un establecimiento por ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = getAuthOrThrow(req);
    const loggedUserId = auth.userId;

    console.log("[USER LOGIN]", auth.userId);

    // Obtenemos el usuario logueado para verificar su rol
    const loggedUser = await db.user.findUnique({
      where: { id: loggedUserId },
      include: { role: true }, // Traemos el rol asociado
    });

    if (!loggedUser) {
      return NextResponse.json(
        { error: "Usuario autenticado no encontrado" },
        { status: 401 }
      );
    }

    const isAdmin = loggedUser.role?.name === "ADMINISTRADOR";

    // ✅ Si no es admin, solo puede eliminarse a sí mismo
    if (!isAdmin && loggedUserId !== params.id) {
      return NextResponse.json(
        { error: "No autorizado para eliminar este usuario" },
        { status: 403 }
      );
    }
    const body = await req.json();
    const { name, lastName, email, roleId, avatarUrl, password } = body;

    const dataToUpdate: any = {
      email,
      name,
      lastName,
      avatarUrl,
      roleId,
    };
    // Hasheamos la contraseña
    if (password && password.trim() !== "") {
      dataToUpdate.password = await hash(password, 10);
    }

    const updated = await db.user.update({
      where: { id: params.id },
      data: dataToUpdate,
    });
    

    return NextResponse.json({ message: "Usuario modificado correctamente" });
  } catch (err) {
    console.error("[UPDATE USER ERROR]", err);
    return NextResponse.json(
      { error: "Error al modificar el usuario" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthOrThrow(req);
    const loggedUserId = auth.userId;

    console.log("[USER LOGIN]", auth.userId);

    // Obtenemos el usuario logueado para verificar su rol
    const loggedUser = await db.user.findUnique({
      where: { id: loggedUserId },
      include: { role: true }, // Traemos el rol asociado
    });

    if (!loggedUser) {
      return NextResponse.json(
        { error: "Usuario autenticado no encontrado" },
        { status: 401 }
      );
    }

    const isAdmin = loggedUser.role?.name === "ADMINISTRADOR";

    // ✅ Si no es admin, solo puede eliminarse a sí mismo
    if (!isAdmin && loggedUserId !== params.id) {
      return NextResponse.json(
        { error: "No autorizado para eliminar este usuario" },
        { status: 403 }
      );
    }

    await db.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("[DELETE USER ERROR]", err);
    return NextResponse.json(
      { error: "Error al eliminar el usuario" },
      { status: 500 }
    );
  }
}