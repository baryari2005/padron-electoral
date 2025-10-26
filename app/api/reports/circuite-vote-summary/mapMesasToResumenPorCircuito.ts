import { groupBy } from "lodash";
import { MesaEscrutadaConDatosCompletos } from "./types";

export function mapMesasToResumenPorCircuito(mesas: MesaEscrutadaConDatosCompletos[]) {
  const agrupado = groupBy(mesas, (m) => m.establecimiento.circuitoId);

  return Object.values(agrupado).map((mesasDelEstablecimiento) => {
    const establecimiento = mesasDelEstablecimiento[0].establecimiento;

    const resultadosMap = new Map<string, { categoria: string; agrupacion: string; logo: string; color: string; votos: number }>();
    const votosEspecialesMap = new Map<string, { categoria: string; tipo: string; cantidad: number }>();
    let resumen = {
      sobresEnUrna: 0,
      electoresVotaron: 0,
      diferencia: 0,
    };

    for (const mesa of mesasDelEstablecimiento) {
      // resultados agrupaciones
      for (const r of mesa.resultadosAgrupaciones) {
        const key = `${r.cargoPolitico.nombre}-${r.agrupacionPolitica.nombre}`;
        if (!resultadosMap.has(key)) {
          resultadosMap.set(key, {
            categoria: r.cargoPolitico.nombre,
            agrupacion: r.agrupacionPolitica.nombre,
            logo: r.agrupacionPolitica.profileImage ?? "/placeholder-logo.png",
            color: r.agrupacionPolitica.color_hex ?? "#000000",
            votos: 0,
          });
        }
        resultadosMap.get(key)!.votos += r.votos;
      }

      // resultados especiales
      for (const e of mesa.resultadosEspeciales) {
        const categoria = e.cargoPolitico.nombre;

        const tipos = [
          { tipo: "Nulo", cantidad: e.votosNulos },
          { tipo: "En blanco", cantidad: e.votosEnBlanco },
          { tipo: "Recurrido", cantidad: e.votosRecurridos },
          { tipo: "Impugnado", cantidad: e.votosImpugnados },
          // { tipo: "Comando", cantidad: e.votosComandoElectoral },
        ];

        for (const { tipo, cantidad } of tipos) {
          const key = `${categoria}-${tipo}`;
          if (!votosEspecialesMap.has(key)) {
            votosEspecialesMap.set(key, { categoria, tipo, cantidad: 0 });
          }
          votosEspecialesMap.get(key)!.cantidad += cantidad;
        }
      }

      // resumen general
      if (mesa.resultadoFinal) {
        resumen.sobresEnUrna += mesa.resultadoFinal.sobresEnUrna;
        resumen.electoresVotaron += mesa.resultadoFinal.electoresVotaron;
        resumen.diferencia += mesa.resultadoFinal.diferencia;
      }
    }

    return {
      circuitoId: establecimiento.circuito.codigo,
      circuito: establecimiento.circuito.nombre,
      resultados: Array.from(resultadosMap.values()),
      votosEspeciales: Array.from(votosEspecialesMap.values()),
      resumen,
    };
  });
}
