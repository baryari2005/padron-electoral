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
import { getColorEspecial, getTiposEspecialesUnicos } from "../../utils/chartUtils";


interface MesaVotosEspecialesChartProps {
  votosEspeciales: MesaVoteSummary["votosEspeciales"];
}

export function MesaVotosEspecialesChart({
  votosEspeciales,
}: MesaVotosEspecialesChartProps) {
  const agrupado: Record<string, any> = {};
  for (const v of votosEspeciales) {
    if (!agrupado[v.categoria]) {
      agrupado[v.categoria] = { categoria: v.categoria };
    }
    agrupado[v.categoria][v.tipo] = v.cantidad;
  }

  const chartData = Object.values(agrupado);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <XAxis dataKey="categoria" />
        <YAxis />
        <Tooltip />
        <Legend />
        {getTiposEspecialesUnicos(votosEspeciales).map((tipo) => (
          <Bar
            key={tipo}
            dataKey={tipo}
            stackId="a"
            fill={getColorEspecial(tipo)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
