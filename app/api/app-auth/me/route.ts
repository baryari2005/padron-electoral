// app/api/auth/me/route.ts
export const runtime = "nodejs";          // evita Edge (bcrypt/crypto nativo)
export const dynamic = "force-dynamic";   // no SSG/ISR
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { formatApiMessage } from "@/lib/utils/formatters";

const SECRET = process.env.JWT_SECRET || "mi_clave_secreta";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  // 🛑 Validación básica
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: formatApiMessage("errors.notAutorized") },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    // ✅ Verificamos el token
    const decoded = jwt.verify(token, SECRET) as { sub: string; email: string };

    const user = await db.usuario.findUnique({
      where: { id: decoded.sub },
      include: {
        rol: {
          include: {
            permisos: {
              where: {
                deletedAt: null,
                permiso: {
                  deletedAt: null,
                },
              },
              include: {
                permiso: true,
              },
            },
          },
        },
        escuelas: {
          include: {
            establecimiento: {
              include: {
                circuito: true
              }
            }
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: formatApiMessage("errors.userNotFound") },
        { status: 404 }
      );
    }

    // ✅ Extraemos permisos en formato de array de strings
    const permisos = user.rol.permisos.map((p) => p.permiso.clave);

    // ✅ Excluimos el password
    const { password, rol, ...safeUser } = user;

    // ✅ Estructura homogénea con el frontend
    return NextResponse.json({
      user: {
        ...safeUser,
        rol: {
          id: rol.id,
          nombre: rol.nombre,
        },
        permisos,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: formatApiMessage("errors.tokenInvalid") },
      { status: 401 }
    );
  }
}
