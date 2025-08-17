import { NextResponse } from "next/server";
import { recomputeAllStats } from "@/src/features/stats/recompute";

export async function POST() {
  try {
    const result = await recomputeAllStats();
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    console.error("Recompute stats error", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Error" }, { status: 500 });
  }
}