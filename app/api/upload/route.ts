export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { randomUUID } from "crypto";
import { supabase } from "@/utils/supabaseClient";


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const fileName = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("profile-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("SUPABASE UPLOAD ERROR:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    const { data: publicData } = supabase.storage
      .from("profile-images")
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: publicData.publicUrl,
    });
  } catch (error) {
    console.error("UPLOAD ROUTE ERROR:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}