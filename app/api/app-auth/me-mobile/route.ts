// app/api/auth/me-mobile/route.ts
export const runtime = "nodejs";          // evita Edge
export const dynamic = "force-dynamic";   // no SSG/ISR
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { formatApiMessage } from "@/lib/utils/formatters";

const SECRET = process.env.JWT_SECRET || "mi_clave_secreta";
const DEBUG = false; // poné true si querés logs en server

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: formatApiMessage("errors.notAutorized") },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  const url = new URL(req.url);
  const uid = url.searchParams.get("uid"); // opcional, por si el login no firmó sub=id

  try {
    const decoded = jwt.verify(token, SECRET) as any;
    if (DEBUG) console.log("[/api/auth/me-mobile] decoded:", decoded, "uid:", uid);

    // Si viene uid, validamos que pertenezca al usuario del token (anti-IDOR)
    if (uid) {
      const ok =
        (decoded?.sub && String(decoded.sub) === String(uid)) ||
        (decoded?.userId && String(decoded.userId) === String(uid)) ||
        (decoded?.id && String(decoded.id) === String(uid));
      if (!ok) {
        return NextResponse.json({ error: "uid no autorizado" }, { status: 403 });
      }
    }

    // Intentos de match: sub=id, sub=userId, userId explícito, email, uid (id/userId)
    const user = await db.usuario.findFirst({
      where: {
        OR: [
          decoded?.sub ? { id: decoded.sub } : undefined,
          decoded?.sub ? { userId: decoded.sub } : undefined,
          decoded?.userId ? { userId: decoded.userId } : undefined,
          decoded?.email ? { email: decoded.email } : undefined,
          uid ? { id: uid } : undefined,
          uid ? { userId: uid } : undefined,
        ].filter(Boolean) as any,
      },
      include: {
        rol: {
          include: {
            permisos: { include: { permiso: true } },
          },
        },
        escuelas: {
          include: {
            establecimiento: { include: { circuito: true } },
          },
        },
      },
    });

    if (!user) {
      if (DEBUG) console.error("[/api/auth/me-mobile] Usuario no encontrado con", { decoded, uid });
      return NextResponse.json(
        { error: formatApiMessage("errors.userNotFound") },
        { status: 404 }
      );
    }

    // 👇 Mobile: bloquear si no tiene escuela asociada
    if (!user.escuelas || user.escuelas.length === 0) {
      return NextResponse.json(
        { error: "Usuario sin escuela asignada" },
        { status: 403 }
      );
    }

    const permisos = user.rol.permisos.map((p) => p.permiso.clave);
    const { password, rol, ...safeUser } = user;

    return NextResponse.json({
      user: {
        ...safeUser,
        rol: { id: rol.id, nombre: rol.nombre },
        permisos,
      },
    });
  } catch (error) {
    if (DEBUG) console.error("[/api/auth/me-mobile] token invalid:", error);
    return NextResponse.json(
      { error: formatApiMessage("errors.tokenInvalid") },
      { status: 401 }
    );
  }
}
