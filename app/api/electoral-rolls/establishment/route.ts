import { db } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  const url = new URL(req.url);
  const all = url.searchParams.get("all") === "true";

  const items = await db.establecimiento.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json(all ? { items } : items);
}