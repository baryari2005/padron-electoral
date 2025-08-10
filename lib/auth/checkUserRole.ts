import { getAuthOrThrow } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { formatApiMessage } from "../utils/formatters";


export function checkUserRole(req: NextRequest, rolesPermitidos: string[]) {
  const auth = getAuthOrThrow(req);

  if (!rolesPermitidos.includes(auth.role)) {
    const response = new NextResponse(
      JSON.stringify({ error: formatApiMessage("errors.notAllowed") }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
    throw response; 
  }

  return auth; // Ya contiene userId, email y role
}
