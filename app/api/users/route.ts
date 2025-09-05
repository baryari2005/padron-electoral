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
      select: {
        id: true,
        userId: true,
        nombre: true,
        apellido: true,
        avatarUrl: true,
        rol: { select: { id: true, nombre: true } },
        // 👇 Traemos el nombre del establecimiento
        escuelas: {
          select: {
            establecimientoId: true,
            establecimiento: { select: { nombre: true } },
          },
        },
      },
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

    console.log(body);

    const {
      userId, nombre, apellido, email, rolId,
      avatarUrl, password, escuelasIds = [],
    } = body;

    let nombreLargo = nombre + " " + apellido;
    const finalProfileImage =
      avatarUrl?.trim() ||
      `https://ui-avatars.com/api/?nombre=${encodeURIComponent(nombreLargo)}&background=adf5d7&color=000&size=128&rounded=true&bold=true&format=png`;


    if (!nombre || !apellido || !userId || !password || !rolId) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const hashPassword =
      await hash(password, 10);

    const created = await db.$transaction(async (tx) => {
      // 1) Usuario
      const user = await tx.usuario.create({
        data: {
          userId,
          nombre,
          apellido,
          email,
          password: hashPassword,
          avatarUrl,
          rolId: Number(rolId),
        },
        select: { id: true },
      });

      // 2) Relaciones con establecimientos (si hay)
      if (Array.isArray(escuelasIds) && escuelasIds.length > 0) {
        await tx.usuarioEstablecimiento.createMany({
          data: escuelasIds.map((establecimientoId) => ({
            usuarioId: user.id,
            establecimientoId,
          })),
          skipDuplicates: true,
        });
      }

      return user;
    });

    console.log(created);

    return NextResponse.json({ created }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/users error:", error?.code, error?.message, error);

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
