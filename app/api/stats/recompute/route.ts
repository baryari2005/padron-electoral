import { NextResponse } from "next/server";
import { recomputeAllStats } from "@/src/features/stats/recompute";
import { withActiveElection } from "@/lib/_server/withActiveElection";

export const POST = withActiveElection(async (req, { election }) => {
  try {
    const result = await recomputeAllStats(election.id);
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    console.error("Recompute stats error", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "Error" }, { status: 500 });
  }
});