export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { db } from "@/lib/db";
import { getAuthOrThrow } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { checkUserRole } from "@/lib/auth/checkUserRole";

export async function GET(req: NextRequest,
  { params }: { params: { id: string } }
) {

  let userId: string;

  try {
    userId = (await checkUserRole(req, ["ADMINISTRADOR", "CARGADOR"])).userId;
  } catch (err) {
    return new NextResponse((err as Response).statusText, { status: (err as Response).status });
  }

  try {

    // Obtenemos el usuario logueado para verificar su rol
    const loggedUser = await db.usuario.findUnique({
      where: { id: userId },
      include: { rol: true }, // Traemos el rol asociado
    });

    if (!loggedUser) {
      return NextResponse.json(
        { error: "Usuario autenticado no encontrado" },
        { status: 401 }
      );
    }

    const isAdmin = loggedUser.rol?.nombre === "ADMINISTRADOR";

    // ✅ Si no es admin, solo puede eliminarse a sí mismo
    if (!isAdmin && userId !== params.id) {
      return NextResponse.json(
        { error: "No autorizado para editar este usuario" },
        { status: 403 }
      );
    }

    const user = await db.usuario.findFirst({
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
  let userId: string;

  try {
    userId = (await checkUserRole(req, ["ADMINISTRADOR", "CARGADOR"])).userId;
  } catch (err) {
    return new NextResponse((err as Response).statusText, { status: (err as Response).status });
  }

  try {

    // Obtenemos el usuario logueado para verificar su rol
    const loggedUser = await db.usuario.findUnique({
      where: { id: userId },
      include: { rol: true }, // Traemos el rol asociado
    });

    if (!loggedUser) {
      return NextResponse.json(
        { error: "Usuario autenticado no encontrado" },
        { status: 401 }
      );
    }

    const isAdmin = loggedUser.rol?.nombre === "ADMINISTRADOR";

    // ✅ Si no es admin, solo puede eliminarse a sí mismo
    if (!isAdmin && userId !== params.id) {
      return NextResponse.json(
        { error: "No autorizado para eliminar este usuario" },
        { status: 403 }
      );
    }
    const body = await req.json();
    const { nombre, apellido, email, rolId, avatarUrl, password } = body;

    const dataToUpdate: any = {
      email,
      nombre,
      apellido,
      avatarUrl,
      rolId
    };
    // Hasheamos la contraseña
    if (password && password.trim() !== "") {
      dataToUpdate.password = await hash(password, 10);
    }

    const updated = await db.usuario.update({
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
  let userId: string;

  try {    
    userId = (await checkUserRole(req, ["ADMINISTRADOR", "CARGADOR"])).userId;
  } catch (err) {
    return new NextResponse((err as Response).statusText, { status: (err as Response).status });
  }

  try {    
    // Obtenemos el usuario logueado para verificar su rol
    const loggedUser = await db.usuario.findUnique({
      where: { id: userId},
      include: { rol: true }, // Traemos el rol asociado
    });

    if (!loggedUser) {
      return NextResponse.json(
        { error: "Usuario autenticado no encontrado" },
        { status: 401 }
      );
    }

    const isAdmin = loggedUser.rol?.nombre === "ADMINISTRADOR";

    // ✅ Si no es admin, solo puede eliminarse a sí mismo
    if (!isAdmin && userId !== params.id) {
      return NextResponse.json(
        { error: "No autorizado para eliminar este usuario" },
        { status: 403 }
      );
    }

    await db.usuario.delete({
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