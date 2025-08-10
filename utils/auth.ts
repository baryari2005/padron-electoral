import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { formatApiMessage } from "@/lib/utils/formatters";

export function getAuthOrThrow(req: NextRequest): {
  userId: string;
  email: string;
  role: string;
} {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    throw new Response(formatApiMessage("errors.notAutorized"), { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      email: string;
      role: string;
    };

    return {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (err) {
    throw new Response(formatApiMessage("errors.tokenInvalid"), { status: 401 });
  }
}