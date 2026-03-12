import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const election = await prisma.eleccion.findFirst({
    where: { estado: "ACTIVE" },
  });

  return NextResponse.json({
    active: !!election,
    election,
  });
}