// Fuerza runtime Node y ejecución dinámica (no prerender)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const maxDuration = 300; // tiempo extra por si el import tarda

import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";
import { importElectoralRoll } from "@/src/features/services/importElectoralRoll";
import { supabase } from "@/utils/supabaseClient";

const BUCKET = process.env.SUPABASE_IMPORT_BUCKET || "imports";

// Cliente server-side con SERVICE ROLE (NO exponer en el cliente)
const supabaseAdmin = supabase

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    const contentType = req.headers.get("content-type") || "";
    let mode: "replace" | "append" = "append";
    let buffer: Buffer | null = null;

    if (contentType.includes("application/json")) {
      // ✅ NUEVO FLUJO (recomendado): recibimos { path } y descargamos del Storage
      const body = await req.json();
      mode = body?.mode === "replace" ? "replace" : "append";
      const path: string | undefined = body?.path;

      if (!path) {
        return NextResponse.json({ error: "path requerido" }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(path);
      if (error || !data) {
        return NextResponse.json(
          { error: error?.message || "No se pudo descargar el archivo del Storage" },
          { status: 400 }
        );
      }
      buffer = Buffer.from(await data.arrayBuffer());
    } else {
      // 🔁 COMPATIBILIDAD LEGACY: sigue aceptando form-data (puede fallar >4.5MB en Vercel)
      const formData = await req.formData();
      const file = formData.get("file");
      mode = (formData.get("mode") as string) === "replace" ? "replace" : "append";

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Archivo no encontrado" }, { status: 400 });
      }
      buffer = Buffer.from(await file.arrayBuffer());
    }

    if (!buffer) {
      return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
    }

    // Tu importador sigue igual: le pasamos el Buffer y el modo
    const result = await importElectoralRoll({ buffer, userId, mode });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Loader error:", err);
    return NextResponse.json({ ok: false, error: "Fallo en el importador." }, { status: 500 });
  }
}
