// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export function middleware(req: NextRequest) {
//   const token = req.headers.get("authorization")?.replace("Bearer ", "");

//   const { pathname } = req.nextUrl;
//   if (pathname.startsWith("/api")) return NextResponse.next();

//   if (!token) {
//     return NextResponse.json({ error: "No autorizado" }, { status: 401 });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!);
//     // podés guardar datos del usuario en headers si querés
//     return NextResponse.next();
//   } catch {
//     return NextResponse.json({ error: "Token inválido o expirado" }, { status: 403 });
//   }
// }

// export const config = {
//   matcher: ["/api/privado/:path*"], // protege cualquier ruta que empiece con /api/privado
// };

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Guardrails: jamás interceptar estáticos/Next assets/archivos con extensión ---
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff2?|ttf)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // --- 1) APIs privadas: /api/privado/* (usa Authorization: Bearer <token>) ---
  if (pathname.startsWith("/api/privado")) {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 403 });
    }
  }

  // --- 2) Páginas protegidas (opcional): usa cookie 'auth_token' ---
  // Agrega o quita prefijos según tus rutas reales del dashboard.
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/certificados")) {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// Aplica a /api/privado/* y a "páginas" (excluyendo estáticos, _next y api genérico)
export const config = {
  matcher: [
    "/api/privado/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|static/|images/|fonts/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff2?|ttf)).*)",
  ],
};
