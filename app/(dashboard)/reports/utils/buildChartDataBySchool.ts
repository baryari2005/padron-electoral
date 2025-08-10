
const ordenPreferido = ["DIPUTADOS", "SENADORES", "PRESIDENTE"];

/**
 * Transforma un objeto con votos por categoría a un array por agrupación.
 * Ej:
 * {
 *   DIPUTADOS: { PJ: 120, UCR: 80 },
 *   SENADORES: { PJ: 100, UCR: 90 }
 * }
 * ⟶ [
 *   { agrupacion: 'PJ', DIPUTADOS: 120, SENADORES: 100 },
 *   { agrupacion: 'UCR', DIPUTADOS: 80, SENADORES: 90 }
 * ]
 */
export function buildChartDataVotosPorCategoria(
  votosPorCategoria: Record<string, Record<string, number>>
) {
  const agrupado: Record<string, any> = {};

  for (const categoria in votosPorCategoria) {
    for (const agrupacion in votosPorCategoria[categoria]) {
      if (!agrupado[agrupacion]) {
        agrupado[agrupacion] = { agrupacion };
      }
      agrupado[agrupacion][categoria] = votosPorCategoria[categoria][agrupacion];
    }
  }

  return Object.values(agrupado);
}

/**
 * Transforma los votos especiales en formato para el gráfico.
 * Ej:
 * {
 *   DIPUTADOS: { Nulo: 10, En blanco: 20 },
 *   SENADORES: { Nulo: 5, Impugnado: 7 }
 * }
 * ⟶ [
 *   { categoria: 'DIPUTADOS', Nulo: 10, 'En blanco': 20 },
 *   { categoria: 'SENADORES', Nulo: 5, Impugnado: 7 }
 * ]
 */
export function buildChartDataVotosEspeciales(
  votosEspecialesPorCategoria: Record<string, Record<string, number>>
) {
  const resultado = Object.entries(votosEspecialesPorCategoria).map(
    ([categoria, tipos]) => ({
      categoria,
      ...tipos,
    })
  );

  return resultado.sort(
    (a, b) =>
      ordenPreferido.indexOf(a.categoria) - ordenPreferido.indexOf(b.categoria)
  );
}
