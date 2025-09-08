// app/api/uploads/avatar/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// helper para envs
function reqEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const SUPABASE_URL   = reqEnv("NEXT_PUBLIC_SUPABASE_URL");
    // Permití cualquiera de los dos nombres:
    const SERVICE_KEY    = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SERVICE_KEY) throw new Error("Missing env: SUPABASE_SERVICE_ROLE or SUPABASE_SERVICE_ROLE_KEY");
    const BUCKET         = reqEnv("SUPABASE_IMPORT_BUCKET"); // p.ej. "avatars"

    // --- leer form ---
    const form = await req.formData();
    const file = form.get("file");
    const folder = (form.get("folder") as string) || "avatars"; // opcional: agrupás por userId si querés
    const prevPath = (form.get("prevPath") as string) || "";     // <--- path anterior opcional

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Falta o es inválido el archivo" }, { status: 400 });
    }

    // mismo límite 200KB que tu UI
    if (file.size > 200 * 1024) {
      return NextResponse.json({ error: "La imagen supera 200KB" }, { status: 400 });
    }

    const ext  = (file.name?.split(".").pop() || "jpg").toLowerCase();
    const path = `${folder}/${crypto.randomUUID()}.${ext}`; // ojo: sin duplicar "avatars/avatars/..."

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // subir como bytes (Node)
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: file.type || "image/jpeg", upsert: true });

    if (uploadError) {
      console.error("[SUPABASE_UPLOAD_ERROR]", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // borrar el anterior si vino y es distinto
    // let deletedOld = false;
    // if (prevPath && prevPath !== path) {
    //   const { error: delError } = await supabase.storage.from(BUCKET).remove([prevPath]);
    //   if (delError) {
    //     // no rompas el flujo: ya subimos el nuevo
    //     console.error("[AVATAR_DELETE_OLD_ERROR]", delError);
    //   } else {
    //     deletedOld = true;
    //   }
    // }

    // URL pública (si el bucket es público)
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    // URL firmada (si el bucket es privado)
    const { data: signed, error: signErr } = await supabase
      .storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60); // 1h
    const signedUrl = signErr ? null : signed.signedUrl;

    return NextResponse.json(
      { ok: true, path, publicUrl, signedUrl },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[UPLOAD_INTERNAL_ERROR]", err);
    const msg = (err && typeof err.message === "string") ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
