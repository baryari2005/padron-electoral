import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const election = await prisma.eleccion.findFirst({
    where: { estado: "ACTIVE" },
  });

  return NextResponse.json({
    active: !!election,
    election,
  });
}