// app/api/scrutiny/cleanup/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Si usás permisos/usuario, podés chequear aquí
async function ensureCanCleanup(/* req: Request */) {
  // TODO: integrá tu auth real. Ejemplo:
  // const user = await getUserFromRequest(req);
  // if (!user || !user.permissions.includes("limpiar_resultados")) {
  //   return NextResponse.json({ ok: false, error: "Acceso denegado" }, { status: 403 });
  // }
  return null; // null = OK
}

const TABLES = [
  `"ResultadoPorAgrupacionPolitica"`,
  `"ResultadoPorMesa"`,
  `"ResultadoVotosEspeciales"`,
  `"DiferenciasPorCargosPoliticos"`,
  `"MesaEscrutada"`,
] as const;

type TableName =
  | "ResultadoPorAgrupacionPolitica"
  | "ResultadoPorMesa"
  | "ResultadoVotosEspeciales"
  | "DiferenciasPorCargosPoliticos"
  | "MesaEscrutada";

async function count(tableQuoted: string): Promise<number> {
  const rows = await db.$queryRawUnsafe<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count FROM ${tableQuoted};`
  );
  return rows[0]?.count ?? 0;
}

export async function GET() {
  // if (await ensureCanCleanup(/*req*/)) return await ensureCanCleanup(/*req*/)!;
  try {
    const started = Date.now();
    const before: Record<TableName, number> = {
      ResultadoPorAgrupacionPolitica: await count(`"ResultadoPorAgrupacionPolitica"`),
      ResultadoPorMesa: await count(`"ResultadoPorMesa"`),
      ResultadoVotosEspeciales: await count(`"ResultadoVotosEspeciales"`),
      DiferenciasPorCargosPoliticos: await count(`"DiferenciasPorCargosPoliticos"`),
      MesaEscrutada: await count(`"MesaEscrutada"`),
    };
    const durationMs = Date.now() - started;
    return NextResponse.json({ ok: true, before, durationMs });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const deny = await ensureCanCleanup(/*req*/);
  if (deny) return deny;

  try {
    const { confirm } = await req.json().catch(() => ({}));
    if (!confirm) {
      return NextResponse.json(
        { ok: false, error: "Falta confirmación. Enviá { confirm: true }" },
        { status: 400 }
      );
    }

    const started = Date.now();

    // Conteos previos
    const before: Record<TableName, number> = {
      ResultadoPorAgrupacionPolitica: await count(`"ResultadoPorAgrupacionPolitica"`),
      ResultadoPorMesa: await count(`"ResultadoPorMesa"`),
      ResultadoVotosEspeciales: await count(`"ResultadoVotosEspeciales"`),
      DiferenciasPorCargosPoliticos: await count(`"DiferenciasPorCargosPoliticos"`),
      MesaEscrutada: await count(`"MesaEscrutada"`),
    };

    // TRUNCATE en una sola sentencia (incluye todas las tablas relacionadas) + reset IDs
    await db.$executeRawUnsafe(`
      TRUNCATE TABLE
        "ResultadoPorAgrupacionPolitica",
        "ResultadoPorMesa",
        "ResultadoVotosEspeciales",
        "DiferenciasPorCargosPoliticos",
        "MesaEscrutada"
      RESTART IDENTITY;
    `);

    // Conteos posteriores (deberían ser 0)
    const after: Record<TableName, number> = {
      ResultadoPorAgrupacionPolitica: await count(`"ResultadoPorAgrupacionPolitica"`),
      ResultadoPorMesa: await count(`"ResultadoPorMesa"`),
      ResultadoVotosEspeciales: await count(`"ResultadoVotosEspeciales"`),
      DiferenciasPorCargosPoliticos: await count(`"DiferenciasPorCargosPoliticos"`),
      MesaEscrutada: await count(`"MesaEscrutada"`),
    };

    const deleted: Record<TableName, number> = {
      ResultadoPorAgrupacionPolitica:
        before.ResultadoPorAgrupacionPolitica - after.ResultadoPorAgrupacionPolitica,
      ResultadoPorMesa: before.ResultadoPorMesa - after.ResultadoPorMesa,
      ResultadoVotosEspeciales: before.ResultadoVotosEspeciales - after.ResultadoVotosEspeciales,
      DiferenciasPorCargosPoliticos:
        before.DiferenciasPorCargosPoliticos - after.DiferenciasPorCargosPoliticos,
      MesaEscrutada: before.MesaEscrutada - after.MesaEscrutada,
    };

    const durationMs = Date.now() - started;

    return NextResponse.json({
      ok: true,
      before,
      after,
      deleted,
      durationMs,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}
