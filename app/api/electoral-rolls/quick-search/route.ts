// app/api/electoral-rolls/quick-search/route.ts
export const dynamic = 'force-dynamic';   // no intentes SSG para esta route
export const revalidate = 0;              // (opcional) sin cache de ISR
export const fetchCache = 'force-no-store'; // (opcional) evita cache de fetch
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

/** Parse filters estilo 0[key]=...&0[value]=... */
function parseIndexedFilters(searchParams: URLSearchParams) {
  const idxs = new Set<number>();

  const out: { key: string; value: string }[] = [];
  Array.from(searchParams.keys()).forEach((k) => {
    const m = k.match(/^(\d+)\[(key|value)\]$/);
    if (m) idxs.add(Number(m[1]));
  });

  Array.from(idxs).forEach((i) => {
    const key = searchParams.get(`${i}[key]`);
    const value = searchParams.get(`${i}[value]`);
    if (key) out.push({ key, value: value ?? "" });
  });
  return out;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl; // ← usa nextUrl, está ok

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(1000, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const q = (searchParams.get("q") || searchParams.get("search") || "").trim();

    // 1) Filtros indexados
    let filters = parseIndexedFilters(searchParams);

    // 2) Filtros planos como fallback (mesaId/numeroMesa/establecimientoId)
    if (filters.length === 0) {
      const plano: { key: string; value: string }[] = [];
      ["establecimientoId", "numeroMesa", "mesaId"].forEach((k) => {
        const v = searchParams.get(k);
        if (v) plano.push({ key: k, value: v });
      });
      filters = plano;
    }

    // Normalizar a objeto
    const fobj = Object.fromEntries(filters.map(f => [f.key, f.value]));

    // Convertir tipos (según tu schema)
    const establecimientoId = fobj.establecimientoId ? Number(fobj.establecimientoId) : undefined;
    let numeroMesa = fobj.numeroMesa ? Number(fobj.numeroMesa) : undefined;

    // Si viene mesaId (id de la mesa) y NO vino numeroMesa, intentar resolver número de mesa
    if (!numeroMesa && fobj.mesaId) {
      try {
        // Ajustá el modelo si tu tabla se llama distinto
        const mesa = await db.mesasPorEstablecimiento.findUnique({
          where: { id: isNaN(Number(fobj.mesaId)) ? (fobj.mesaId as any) : Number(fobj.mesaId) },
          select: { numero: true },
        });
        if (mesa?.numero != null) numeroMesa = Number(mesa.numero);
      } catch {
        // si no existe el modelo Mesa o el id no matchea, ignoramos
      }
    }

    const AND: Prisma.PadronElectoralWhereInput[] = [];
    if (Number.isFinite(establecimientoId)) AND.push({ establecimientoId: establecimientoId as number });
    if (Number.isFinite(numeroMesa)) AND.push({ numeroMesa: numeroMesa as number });

    if (q) {
      AND.push({
        OR: [
          { numeroMatricula: { contains: q, mode: "insensitive" } },
          { apellido: { contains: q, mode: "insensitive" } },
          { nombre: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    const where: Prisma.PadronElectoralWhereInput | undefined = AND.length ? { AND } : undefined;

    const [items, total, totalVotaron] = await Promise.all([
      db.padronElectoral.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
        select: {
          id: true,
          numeroMatricula: true,
          apellido: true,
          nombre: true,
          numeroMesa: true,
          establecimientoId: true,
          votoSiNo: true,        // 👈 NUEVO
          votedAt: true,
          votedBy: true,
        },
      }),
      db.padronElectoral.count({ where }),
      db.padronElectoral.count({
        where: {
          ...(where ?? {}),
          votoSiNo: "S",         // 👈 EN VEZ DE votedAt != null
        },
      }),
    ]);

    const aggregates = {
      total,
      votaron: totalVotaron,
      pendientes: total - totalVotaron,
    };

    return NextResponse.json({ items, total, page, limit, aggregates });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

