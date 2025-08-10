import { formatApiMessage } from "@/lib/utils/formatters";
import { NextResponse } from "next/server";

export function parseIdOrThrow(idParam: string): number {
  const id = Number(idParam);
  if (isNaN(id)) throw new Error("INVALID_ID");
  return id;
}

export function jsonError(messageKey: string, status = 400) {
  return NextResponse.json({ error: formatApiMessage(messageKey) }, { status });
}
