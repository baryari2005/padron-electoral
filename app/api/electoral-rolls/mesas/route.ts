export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  const url = new URL(req.url);
  const establecimientoId = url.searchParams.get("establecimientoId");

  if (!establecimientoId) {
    return NextResponse.json({ error: "establecimientoId requerido" }, { status: 400 });
  }

  const items = await db.mesasPorEstablecimiento.findMany({
    where: { establecimientoId: Number(establecimientoId) },
    select: { id: true, numero: true },
    orderBy: { numero: "asc" },
  });

  return NextResponse.json({ items });
}

