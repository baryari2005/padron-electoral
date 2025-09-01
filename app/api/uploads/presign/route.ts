// app/api/uploads/presign/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const BUCKET = process.env.SUPABASE_IMPORT_BUCKET || 'imports';

let _admin: SupabaseClient | null = null;
function getAdmin() {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE!;
  _admin = createClient(url, key);
  return _admin;
}

function safeName(n: string) {
  return String(n).replace(/[^\w.\-]/g, '_');
}

export async function POST(req: NextRequest) {
  const { filename, upsert } = await req.json().catch(() => ({}));
  if (!filename) return NextResponse.json({ error: 'filename requerido' }, { status: 400 });

  // ⬅️ NO pongas “imports/” acá si ya es el nombre del bucket.
  const path = `${Date.now()}-${safeName(filename)}`;

  const supabase = getAdmin();
  const { data, error } = await supabase
    .storage
    .from(BUCKET)
    .createSignedUploadUrl(path, { upsert: !!upsert });

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? `No se pudo firmar (bucket "${BUCKET}")` }, { status: 400 });
  }
  // ⬅️ Devolvé TAMBIÉN el bucket para usar el mismo en el cliente
  return NextResponse.json({ bucket: BUCKET, path, token: data.token, signedUrl: data.signedUrl });
}
