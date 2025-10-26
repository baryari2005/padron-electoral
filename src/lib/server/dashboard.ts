// src/lib/server/dashboard.ts
import "server-only";
import { db } from "@/lib/db";

const pct = (n: number, d: number) => (d > 0 ? +((n / d) * 100).toFixed(1) : 0);

export async function getDashboardSummary() {
  // --------- GLOBALES ----------
  const global = await db.globalStats.findUnique({ where: { id: 1 } });
  const padronTotal = global?.padronTotal ?? 0;
  const mesasTotales = global?.mesasTotales ?? 0;

  const mesasEscrutadas = await db.mesaEscrutada.count({ where: { deletedAt: null } });

  const aggRM = await db.resultadoPorMesa.aggregate({
    _sum: { electoresVotaron: true, sobresEnUrna: true },
  });
  const votantesRegistrados =
    (aggRM._sum.electoresVotaron ?? 0) || (aggRM._sum.sobresEnUrna ?? 0);

  const porcentajeEscrutado = pct(mesasEscrutadas, mesasTotales);
  const participacionMunicipal = pct(votantesRegistrados, padronTotal);

  // --------- MAPA mesaId -> (establecimientoId, circuitoId) ----------
  const mesas = await db.mesaEscrutada.findMany({
    where: { deletedAt: null },
    select: { id: true, establecimientoId: true, circuitoId: true },
  });
  const mesaInfo = new Map(mesas.map((m) => [m.id, m]));

  // --------- VOTOS por mesa (para TOPs) ----------
  const votosPorMesa = await db.resultadoPorAgrupacionPolitica.groupBy({
    by: ["mesaId"],
    _sum: { votos: true },
  });

  const votosPorEst: Record<number, number> = {};
  const votosPorCirc: Record<number, number> = {};
  for (const vm of votosPorMesa) {
    const info = mesaInfo.get(vm.mesaId);
    if (!info) continue;
    const v = vm._sum.votos ?? 0;
    votosPorEst[info.establecimientoId] = (votosPorEst[info.establecimientoId] ?? 0) + v;
    votosPorCirc[info.circuitoId] = (votosPorCirc[info.circuitoId] ?? 0) + v;
  }

  // --------- VOTANTES por mesa ----------
  const votantesPorMesa = await db.resultadoPorMesa.findMany({
    select: { mesaId: true, electoresVotaron: true, sobresEnUrna: true },
  });
  const votantesPorEst: Record<number, number> = {};
  const votantesPorCir: Record<number, number> = {};
  for (const r of votantesPorMesa) {
    const info = mesaInfo.get(r.mesaId);
    if (!info) continue;
    const val = r.electoresVotaron ?? r.sobresEnUrna ?? 0;
    votantesPorEst[info.establecimientoId] = (votantesPorEst[info.establecimientoId] ?? 0) + val;
    votantesPorCir[info.circuitoId] = (votantesPorCir[info.circuitoId] ?? 0) + val;
  }

  // --------- PADRON y MESAS TOTALES por escuela/circuito ----------
  const [estStats, circStats] = await Promise.all([
    db.establecimientoStats.findMany({
      select: { establecimientoId: true, padronTotal: true, mesasCount: true },
    }),
    db.circuitoStats.findMany({
      select: { circuitoId: true, padronTotal: true, mesasCount: true },
    }),
  ]);

  // Escrutadas por escuela/circuito
  const [escrEst, escrCir] = await Promise.all([
    db.mesaEscrutada.groupBy({
      by: ["establecimientoId"],
      where: { deletedAt: null },
      _count: { _all: true },
    }),
    db.mesaEscrutada.groupBy({
      by: ["circuitoId"],
      where: { deletedAt: null },
      _count: { _all: true },
    }),
  ]);
  const estEsMap = new Map(escrEst.map((x) => [x.establecimientoId, x._count._all]));
  const cirEsMap = new Map(escrCir.map((x) => [x.circuitoId, x._count._all]));

  // Nombres
  const [ests, circs] = await Promise.all([
    db.establecimiento.findMany({
      where: {
        id: {
          in: Array.from(
            new Set([
              ...Object.keys(votosPorEst).map(Number),
              ...estStats.map((s) => s.establecimientoId),
            ])
          ),
        },
      },
      select: { id: true, nombre: true },
    }),
    db.circuito.findMany({
      where: {
        id: {
          in: Array.from(
            new Set([
              ...Object.keys(votosPorCirc).map(Number),
              ...circStats.map((s) => s.circuitoId),
            ])
          ),
        },
      },
      select: { id: true, nombre: true, codigo: true },
    }),
  ]);
  const estName = new Map(ests.map((e) => [e.id, e.nombre]));
  const cirName = new Map(circs.map((c) => [c.id, c.nombre || c.codigo]));

  // --------- TOPs por votos ----------
  const topEstablecimientos = Object.entries(votosPorEst)
    .map(([id, votos]) => ({
      establecimientoId: +id,
      establecimiento: estName.get(+id) ?? `ID ${id}`,
      votos,
    }))
    .sort((a, b) => b.votos - a.votos)
    .slice(0, 5);

  const topCircuitos = Object.entries(votosPorCirc)
    .map(([id, votos]) => ({
      circuitoId: +id,
      circuito: cirName.get(+id) ?? `ID ${id}`,
      votos,
    }))
    .sort((a, b) => b.votos - a.votos)
    .slice(0, 5);

  // --------- PROGRESO ----------
  const progresoPorEscuela = estStats
    .map((s) => {
      const escr = estEsMap.get(s.establecimientoId) ?? 0;
      return {
        establecimientoId: s.establecimientoId,
        establecimiento: estName.get(s.establecimientoId) ?? `ID ${s.establecimientoId}`,
        mesasEscrutadas: escr,
        mesasTotales: s.mesasCount,
        porcentaje: pct(escr, s.mesasCount),
        faltan: Math.max(s.mesasCount - escr, 0),
      };
    })
    .sort((a, b) => b.porcentaje - a.porcentaje);

  const progresoPorCircuito = circStats
    .map((s) => {
      const escr = cirEsMap.get(s.circuitoId) ?? 0;
      return {
        circuitoId: s.circuitoId,
        circuito: cirName.get(s.circuitoId) ?? `ID ${s.circuitoId}`,
        mesasEscrutadas: escr,
        mesasTotales: s.mesasCount,
        porcentaje: pct(escr, s.mesasCount),
        faltan: Math.max(s.mesasCount - escr, 0),
      };
    })
    .sort((a, b) => b.porcentaje - a.porcentaje);

  // --------- PARTICIPACIÓN ----------
  const participacionEscuelas = estStats
    .map((s) => {
      const vot = votantesPorEst[s.establecimientoId] ?? 0;
      return {
        establecimientoId: s.establecimientoId,
        establecimiento: estName.get(s.establecimientoId) ?? `ID ${s.establecimientoId}`,
        votantes: vot,
        padron: s.padronTotal,
        participacion: pct(vot, s.padronTotal),
      };
    })
    .sort((a, b) => b.participacion - a.participacion);

  const participacionCircuitos = circStats
    .map((s) => {
      const vot = votantesPorCir[s.circuitoId] ?? 0;
      return {
        circuitoId: s.circuitoId,
        circuito: cirName.get(s.circuitoId) ?? `ID ${s.circuitoId}`,
        votantes: vot,
        padron: s.padronTotal,
        participacion: pct(vot, s.padronTotal),
      };
    })
    .sort((a, b) => b.participacion - a.participacion);

  // --------- VOTOS ESPECIALES ----------
  const especialesAgg = await db.resultadoVotosEspeciales.aggregate({
    _sum: {
      votosNulos: true,
      votosEnBlanco: true,
      votosRecurridos: true,
      votosImpugnados: true,
      // votosComandoElectoral: true,
    },
  });
  const especiales = {
    nulos: especialesAgg._sum.votosNulos ?? 0,
    blancos: especialesAgg._sum.votosEnBlanco ?? 0,
    recurridos: especialesAgg._sum.votosRecurridos ?? 0,
    impugnados: especialesAgg._sum.votosImpugnados ?? 0,
    // comando: especialesAgg._sum.votosComandoElectoral ?? 0,
  };
  const especialesTotal = Object.values(especiales).reduce((a, b) => a + b, 0);
  const especialesPctSobreVotantes = pct(especialesTotal, Math.max(votantesRegistrados, 1));

  // --------- LÍDER POR CATEGORÍA ----------
  const aggCatAgr = await db.resultadoPorAgrupacionPolitica.groupBy({
    by: ["categoriaId", "agrupacionId"],
    _sum: { votos: true },
  });
  const categorias = await db.cargoPolitico.findMany({
    select: { id: true, nombre: true, orden: true },
  });

  const totalesMap = new Map<number, number>();
  for (const row of aggCatAgr) {
    const v = row._sum.votos ?? 0;
    totalesMap.set(row.categoriaId, (totalesMap.get(row.categoriaId) ?? 0) + v);
  }

  const totalesPorCategoria = categorias
    .map((c) => ({
      categoriaId: c.id,
      categoria: c.nombre,
      votos: totalesMap.get(c.id) ?? 0,
      orden: c.orden ?? 9999,
    }))
    .sort((a, b) => (a.orden ?? 9999) - (b.orden ?? 9999));

  const agrupaciones = await db.agrupacionPolitica.findMany({
    select: { id: true, nombre: true, profileImage: true, color_hex: true },
  });
  const catById = new Map(categorias.map((c) => [c.id, c]));
  const agrById = new Map(agrupaciones.map((a) => [a.id, a]));

  const resultadosCategoriaAgrupacion = aggCatAgr.map((row) => {
    const c = catById.get(row.categoriaId);
    const a = agrById.get(row.agrupacionId);
    return {
      categoriaId: row.categoriaId,
      categoria: c?.nombre ?? `ID ${row.categoriaId}`,
      agrupacionId: row.agrupacionId,
      agrupacion: a?.nombre ?? `ID ${row.agrupacionId}`,
      votos: row._sum.votos ?? 0,
      logo: a?.profileImage ?? null,
      color: a?.color_hex ?? "#cccccc",
    };
  });

  const byCat: Record<number, { agrupacionId: number; votos: number }> = {};
  for (const row of aggCatAgr) {
    const votos = row._sum.votos ?? 0;
    const prev = byCat[row.categoriaId];
    if (!prev || votos > prev.votos) {
      byCat[row.categoriaId] = { agrupacionId: row.agrupacionId, votos };
    }
  }
  const lideresPorCategoria = Object.entries(byCat)
    .map(([categoriaId, v]) => {
      const c = catById.get(+categoriaId);
      const a = agrById.get(v.agrupacionId);
      return {
        categoriaId: +categoriaId,
        categoria: c?.nombre ?? `ID ${categoriaId}`,
        agrupacionId: v.agrupacionId,
        agrupacion: a?.nombre ?? `ID ${v.agrupacionId}`,
        votos: v.votos,
        color: a?.color_hex ?? "#cccccc",
        logo: a?.profileImage ?? null,
        orden: c?.orden ?? 9999,
      };
    })
    .sort((x, y) => (x.orden ?? 9999) - (y.orden ?? 9999));

  // --------- RESULTADO ----------
  return {
    ok: true as const,
    municipio: {
      padronTotal,
      mesasTotales,
      mesasEscrutadas,
      porcentajeEscrutado,
      votantesRegistrados,
      participacionMunicipal,
      faltanMesas: Math.max(mesasTotales - mesasEscrutadas, 0),
    },
    top: {
      establecimientos: topEstablecimientos,
      circuitos: topCircuitos,
    },
    progreso: {
      porEscuela: progresoPorEscuela,
      porCircuito: progresoPorCircuito,
    },
    participacion: {
      porEscuela: participacionEscuelas,
      porCircuito: participacionCircuitos,
    },
    especiales: {
      ...especiales,
      total: especialesTotal,
      pctSobreVotantes: especialesPctSobreVotantes,
    },
    lideresPorCategoria,
    totalesPorCategoria,
    resultadosCategoriaAgrupacion,
  };
}

export type DashboardSummary = Awaited<ReturnType<typeof getDashboardSummary>>;
