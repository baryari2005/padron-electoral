import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const companies = await db.company.findMany({
      orderBy: { createAt: "desc" }
    });

    const events = await db.event.findMany({
      orderBy: { createAt: "desc" }
    });

    return NextResponse.json({ companies, events });
  } catch (error) {
    console.error("[API_ANALYTICS]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
