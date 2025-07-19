import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const localidadesRaw = await db.padronElectoral.findMany({
      where: {
        localidad: {
          not: undefined
        },
      },
      select: {
        localidad: true,
      },
      distinct: ["localidad"],
    });

    // Validación estricta para evitar `null`
    const localidades: string[] = localidadesRaw
      .map((item) => item.localidad)
      .filter((loc): loc is string => typeof loc === "string")
      .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

    return NextResponse.json({ localidades });
  } catch (error) {
    console.error("[LOCALIDADES_GET]", error);
    return NextResponse.json({ error: "Error al obtener localidades" }, { status: 500 });
  }
}
