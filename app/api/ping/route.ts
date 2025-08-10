export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() { return NextResponse.json({}, { status: 200 }); }
export async function GET()      { return NextResponse.json({ ok: true, method: "GET" }); }
export async function POST(req: NextRequest) {
  const raw = await req.text();
  return NextResponse.json({ ok: true, method: "POST", raw });
}