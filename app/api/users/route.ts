import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getAuthOrThrow } from "@/utils/auth";
import { hash } from "bcryptjs";

// Obtener todos los usuario con su rol
export async function GET() {
  const users = await db.user.findMany({
    include: {
      role: true,
    },
  });

  console.log("[USUARIOS GET]", JSON.stringify(users, null, 2));
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  let userId: string;

  try {
    const auth = getAuthOrThrow(req);
    userId = auth.userId;
  } catch (err) {
    return new NextResponse((err as Response).statusText, { status: (err as Response).status });
  }

  try {
    const body = await req.json();
    const { name, lastName, avatarUrl, password, userId, roleId } = body;

    let nombre = name + " " + lastName;
    const finalProfileImage =
      avatarUrl?.trim() ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=adf5d7&color=000&size=128&rounded=true&bold=true`;


    if (!name || !lastName || !userId || !password || !roleId) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const userData: any = {
      ...body,
    };

    if (password && password.trim() !== "") {
      const hashPassword = await hash(password, 10);
      userData.password = hashPassword;
    }

    const createdUser = await db.user.create({
      data: userData,
    });

    return NextResponse.json({ createdUser }, { status: 201 });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese nombre." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}