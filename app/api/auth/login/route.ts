import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { identifier, password } = await req.json();

  if (!identifier || !password) {
    return new Response(JSON.stringify({ error: "Faltan credenciales" }), { status: 400 });
  }
  const user = await db.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { userId: identifier }
      ]
    },
    include: { role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  return NextResponse.json({ token });
}
