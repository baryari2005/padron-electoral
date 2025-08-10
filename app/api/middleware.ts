// middleware.ts (en raíz del proyecto)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "mi_clave_secreta";

// Mapear rutas y los permisos necesarios
const permisosPorRuta: { [key: string]: string } = {
  "/api/users": "usuarios.ver",
  "/api/users/create": "usuarios.crear",
  "/api/users/edit": "usuarios.editar",
  "/api/users/delete": "usuarios.eliminar",
  "/api/categories": "categorias.ver",
  "/api/categories/create": "categorias.crear",
  // Agregá todos los endpoints y permisos necesarios
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Buscar qué permiso necesita esta ruta
  const permisoNecesario = Object.entries(permisosPorRuta).find(([ruta]) =>
    pathname.startsWith(ruta)
  )?.[1];

  // Si no requiere permisos, continuar
  if (!permisoNecesario) return NextResponse.next();

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  if (!token) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  try {
    const decoded = jwt.verify(token, SECRET) as { sub: string };

    const user = await db.usuario.findUnique({
      where: { id: decoded.sub },
      include: {
        rol: {
          include: {
            permisos: { include: { permiso: true } },
          },
        },
      },
    });

    const permisos = user?.rol?.permisos?.map((p) => p.permiso.clave) ?? [];

    if (!permisos.includes(permisoNecesario)) {
      return NextResponse.json({ error: "No tenés permisos" }, { status: 403 });
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}

export const config = {
  matcher: [
    "/api/users/:path*",
    "/api/categories/:path*",
    "/api/roles/:path*",
    "/api/circuitos/:path*",
    // Agregá aquí los módulos que requieren validación
  ],
};