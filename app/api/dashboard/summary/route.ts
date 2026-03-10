import { withActiveElection } from "@/lib/_server/withActiveElection";
import { getDashboardSummary } from "@/src/lib/server/dashboard";
import { NextResponse } from "next/server";

// ⚙️ Desactiva cualquier forma de caché
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export const GET = withActiveElection(async (req, { election }) => {  
  const data = await getDashboardSummary(election.id, election.tipo);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
});