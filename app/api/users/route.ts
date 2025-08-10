export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma, Rol } from '@prisma/client';
import { getAuthOrThrow } from "@/utils/auth";
import { hash } from "bcryptjs";

// Obtener todos los usuario con su rol
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const terms = search.trim().split(" ").filter(Boolean);
  const part1 = terms[0] ?? "";
  const part2 = terms[1] ?? "";
  let where: Prisma.UsuarioWhereInput | undefined = undefined;

  if (terms.length > 0) {
    where = {
      AND: [
        {
          OR: [
            { nombre: { startsWith: search, mode: Prisma.QueryMode.insensitive } },
            { apellido: { startsWith: search, mode: Prisma.QueryMode.insensitive } },
            {
              AND: [
                { nombre: { contains: part1, mode: Prisma.QueryMode.insensitive } },
                { apellido: { contains: part2, mode: Prisma.QueryMode.insensitive } },
              ],
            },
            {
              AND: [
                { nombre: { contains: part1, mode: Prisma.QueryMode.insensitive } },
                { apellido: { contains: part2, mode: Prisma.QueryMode.insensitive } },
              ],
            },
          ],
        },
      ],
    };
  }

  const [usuarios, total] = await Promise.all([
    db.usuario.findMany({
      where,
      include: { rol: true },
      skip,
      take: limit,
      orderBy: { nombre: "asc" },
    }),
    db.usuario.count({ where }),
  ]);

  return NextResponse.json({ items: usuarios, total });
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
    const { nombre, apellido, avatarUrl, password, userId, rolId, email } = body;

    let nombreLargo = nombre + " " + apellido;
    const finalProfileImage =
      avatarUrl?.trim() ||
      `https://ui-avatars.com/api/?nombre=${encodeURIComponent(nombreLargo)}&background=adf5d7&color=000&size=128&rounded=true&bold=true`;


    if (!nombre || !apellido || !userId || !password || !rolId) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const userData: any = {
      ...body,
    };

    if (password && password.trim() !== "") {
      const hashPassword = await hash(password, 10);
      userData.password = hashPassword;
    }

    const createdUser = await db.usuario.create({
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
