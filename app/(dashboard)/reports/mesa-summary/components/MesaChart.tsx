"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MesaVoteSummary } from "./types";
import { getCategoriasUnicas, getColor } from "../../utils/chartUtils";


interface MesaChartProps {
  resultados: MesaVoteSummary["resultados"];
  stacked: boolean;
}

export function MesaChart({ resultados, stacked }: MesaChartProps) {
  const agrupado: Record<string, any> = {};
  for (const r of resultados) {
    if (!agrupado[r.agrupacion]) {
      agrupado[r.agrupacion] = { agrupacion: r.agrupacion, logo: r.logo };
    }
    agrupado[r.agrupacion][r.categoria] = r.votos;
  }

  const chartData = Object.values(agrupado);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <XAxis dataKey="agrupacion" />
        <YAxis />
        <Tooltip />
        <Legend />
        {getCategoriasUnicas(resultados).map((cat) => (
          <Bar
            key={cat}
            dataKey={cat}
            stackId={stacked ? "a" : undefined}
            fill={getColor(cat)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
