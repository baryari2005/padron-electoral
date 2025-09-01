// app/api/health/db/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const u = new URL(process.env.DATABASE_URL!);
  try {
    const [{ now }] = await db.$queryRawUnsafe<{ now: string }[]>(
      'select now() as now'
    );
    return NextResponse.json({
      ok: true,
      host: u.hostname,
      db: u.pathname.slice(1),
      now,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, host: u.hostname, db: u.pathname.slice(1), error: e.message },
      { status: 500 }
    );
  }
}
