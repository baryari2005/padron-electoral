import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { formatApiMessage } from "@/lib/utils/formatters";

export async function POST(req: Request) {
  const { identifier, password } = await req.json();

  if (!identifier || !password) {
    return new Response(JSON.stringify({ error: "Faltan credenciales" }), { status: 400 });
  }
  const user = await db.usuario.findFirst({
    where: {
      OR: [
        { email: identifier },
        { userId: identifier }
      ]
    },
    include: {
      rol: {
        include: {
          permisos: {
            include: {
              permiso: true,
            }
          }
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: formatApiMessage("errors.userNotFound") }, { status: 401 });

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) return NextResponse.json({ error: formatApiMessage("errors.invalidPassword") }, { status: 401 });

  const permisos = user?.rol?.permisos.map(p => p.permiso.clave);

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.rol.nombre,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      permisos, // 👈 incluimos aquí
    }
  });
}
