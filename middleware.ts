import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // podés guardar datos del usuario en headers si querés
    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 403 });
  }
}

export const config = {
  matcher: ["/api/privado/:path*"], // protege cualquier ruta que empiece con /api/privado
};
