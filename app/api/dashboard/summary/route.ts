import { getDashboardSummary } from "@/src/lib/server/dashboard";
import { NextResponse } from "next/server";

// ⚙️ Desactiva cualquier forma de caché
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export async function GET() {
  const data = await getDashboardSummary();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}