export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";
import { importElectoralRoll } from "@/src/features/services/importElectoralRoll";


export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    const formData = await req.formData();
    const file = formData.get("file");
    const mode = (formData.get("mode") as string) === "replace" ? "replace" : "append";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 400 });
    }


    console.log("[MODE]", mode);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await importElectoralRoll({
      buffer,
      userId,
      mode,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Loader error:", err);
    return NextResponse.json({ error: "Fallo en el importador." }, { status: 500 });
  }
}
