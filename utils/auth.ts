import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function getAuthOrThrow(req: NextRequest): { userId: string } {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  console.log("[TOKEN]", token);

  if (!token) {
    throw new Response("No autorizado", { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
    return { userId: decoded.sub }; 
  } catch (err) {
    throw new Response("Token inválido", { status: 401 });
  }
}