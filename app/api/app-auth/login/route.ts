export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";

/** Rutas de cortesía para no romper al abrir en el navegador / preflight */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/app-auth/login" }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();
    if (!identifier || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    // 👉 Lazy imports para evitar errores en carga de módulo
    const { db } = await import("@/lib/db");
    const bcrypt = (await import("bcrypt")).default;
    const jwt = (await import("jsonwebtoken")).default;

    const user = await db.usuario.findFirst({
      where: { OR: [{ email: identifier }, { userId: identifier }] },
      include: { rol: { include: { permisos: { include: { permiso: true } } } } },
    });

    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: "Contraseña inválida" }, { status: 401 });

    const secret = process.env.JWT_SECRET;
    if (!secret) return NextResponse.json({ error: "JWT_SECRET no configurado" }, { status: 500 });

    const token = jwt.sign({ sub: user.id, email: user.email, role: user.rol.nombre }, secret, {
      expiresIn: "1d",
    });

    const permisos = user.rol?.permisos?.map((p: any) => p.permiso.clave) ?? [];

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, nombre: user.nombre, permisos },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
