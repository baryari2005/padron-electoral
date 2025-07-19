import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db"; // ajustá la ruta si tu db está en otro lado

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, password, roleId, name, lastName, avatarUrl} = body;

    if (!userId || !email || !password || !roleId) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Verificar si ya existe un usuario con ese email
    const existingUser = await db.user.findFirst({
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
    await db.user.create({
      data: {        
        name,
        lastName,
        userId,
        email,
        password: hashedPassword,
        roleId,
        avatarUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=404040&color=fff&size=128&rounded=true&bold=true`
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

    // Verificamos que exista el usuario
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Hasheamos la contraseña
    const hashedPassword = await hash(password, 10);

    // Actualizamos el usuario
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        name,
        lastName,
        password: hashedPassword,
        avatarUrl,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Usuario actualizado correctamente", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}