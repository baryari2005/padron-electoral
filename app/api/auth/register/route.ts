import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db"; // ajustá la ruta si tu db está en otro lado

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, password, roleId, name, lastName, avatarUrl } = body;

    if (!userId || !email || !password || !roleId) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Verificar si ya existe un usuario con ese email
    const existingUser = await db.usuario.findFirst({
      where: {
        OR: [
          { email: email },
          { userId: userId }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 });
    }

    // Hashear la contraseña antes de guardar
    const hashedPassword = await hash(password, 10);

    let userName = name + " " + lastName;

    // Crear el usuario
    await db.usuario.create({
      data: {
        nombre: name,
        apellido: lastName,
        userId,
        email,
        password: hashedPassword,
        rolId: roleId,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=404040&color=fff&size=128&rounded=true&bold=true`
      },
    });

    return NextResponse.json({ message: "Usuario creado exitosamente" }, { status: 201 });
  } catch (error) {
    console.error("Error en el registro:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}


export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, email, name, lastName, password, avatarUrl } = body;

    if (!id || !name || !lastName || !password) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Verificar existencia
    const existingUser = await db.usuario.findUnique({ where: { id } });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const updated = await db.usuario.update({
      where: { id },
      data: {
        nombre: name,
        apellido: lastName,
        password: hashedPassword,
        avatarUrl,
        updatedAt: new Date(),
      },
      include: {
        rol: {
          include: {
            permisos: {
              include: { permiso: true }
            }
          }
        }
      }
    });

    const permisos = updated.rol.permisos.map((p) => p.permiso.clave);
    const { password: _, rol, ...safeUser } = updated;

    return NextResponse.json({
      message: "Usuario actualizado correctamente",
      user: {
        ...safeUser,
        rol: {
          id: rol.id,
          nombre: rol.nombre,
        },
        permisos,
      }
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
