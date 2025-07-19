import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Obtener todos los roles
export async function GET() {
  const users = await db.user.findMany({
    select: { userId: true, name: true, lastName: true, email: true, roleId: true },
  });
  return NextResponse.json({ users });
}

