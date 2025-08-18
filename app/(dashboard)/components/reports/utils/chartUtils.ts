import { VoteSummary } from "@/app/(dashboard)/reports/components/types/MesaVoteSummary.type";

const ordenPreferido = ["", ""];

export function buildChartData(resultados: VoteSummary["resultados"]) {
  const agrupado: Record<string, any> = {};
  
  for (const r of resultados) {
    if (!agrupado[r.agrupacion]) {
      agrupado[r.agrupacion] = { agrupacion: r.agrupacion, logo: r.logo };
    }
    agrupado[r.agrupacion][r.categoria] = r.votos;
  }
  return Object.values(agrupado);
}

export function getCategoriasUnicas(resultados: VoteSummary["resultados"]) {
  const set = new Set<string>();
  resultados.forEach((r) => set.add(r.categoria));
   const categorias = Array.from(set);
  
  return categorias.sort(
    (a, b) => ordenPreferido.indexOf(a) - ordenPreferido.indexOf(b)
  );
}

export function getColor(categoria: string): string {
  const colores: Record<string, string> = {
    Presidente: "#8884d8",
    Diputado: "#82ca9d",
    Parlamentario: "#ffc658",
  };
  return colores[categoria] || randomColor();
}

export function buildRankingByCategoria(
  resultados: VoteSummary["resultados"]
): Record<string, { agrupacion: string; votos: number; logo?: string | null }[]> {
  const agrupado: Record<string, Record<string, { agrupacion: string; votos: number; logo?: string | null }>> = {};
  for (const r of resultados) {
    if (!agrupado[r.categoria]) agrupado[r.categoria] = {};
    if (!agrupado[r.categoria][r.agrupacion]) {
      agrupado[r.categoria][r.agrupacion] = {
        agrupacion: r.agrupacion,
        votos: 0,
        logo: r.logo,
      };
    }
    agrupado[r.categoria][r.agrupacion].votos += r.votos;
  }

  const final: Record<string, { agrupacion: string; votos: number; logo?: string | null }[]> = {};
  for (const cat in agrupado) {
    final[cat] = Object.values(agrupado[cat]).sort((a, b) => b.votos - a.votos);
  }
  return final;
}

export function buildChartDataVotosEspeciales(
  votosEspeciales: VoteSummary["votosEspeciales"]
) {
  
  const agrupado: Record<string, any> = {};
  for (const v of votosEspeciales) {
    if (!agrupado[v.categoria]) {
      agrupado[v.categoria] = { categoria: v.categoria };
    }
    agrupado[v.categoria][v.tipo] = v.cantidad;
  }

  const resultadoOrdenado = Object.values(agrupado).sort(
    (a, b) =>
      ordenPreferido.indexOf(a.categoria) - ordenPreferido.indexOf(b.categoria)
  );

  return resultadoOrdenado;
}

export function getTiposEspecialesUnicos(
  especiales: VoteSummary["votosEspeciales"]
) {
  const set = new Set<string>();
  especiales.forEach((v) => set.add(v.tipo));
  return Array.from(set);
}

export function getColorEspecial(tipo: string): string {
  const colores: Record<string, string> = {
    Nulo: "#e57373",
    "En blanco": "#90caf9",
    Recurrido: "#ffb74d",
    Impugnado: "#aed581",
    Comando: "#ce93d8",
  };
  return colores[tipo] || randomColor();
}

function randomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}
