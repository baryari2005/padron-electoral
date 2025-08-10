import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { formatApiMessage } from "../utils/formatters";

const SECRET = process.env.JWT_SECRET!;

export function getUserIdFromRequest(req: NextRequest): string {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) throw new Error(formatApiMessage("errors.tokenNotFound"));

  const { sub } = jwt.verify(token, SECRET) as { sub: string };
  return sub;
}