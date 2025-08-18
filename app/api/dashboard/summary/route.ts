import { getDashboardSummary } from "@/src/lib/server/dashboard";
import { NextResponse } from "next/server";


export async function GET() {
  const data = await getDashboardSummary();
  return NextResponse.json(data);
}