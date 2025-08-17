"use client";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import { CustomTooltip, CustomLegend } from "@/app/(dashboard)/reports/components";
import { buildChartDataVotosEspeciales, getColorEspecial, getTiposEspecialesUnicos } from "../utils/chartUtils";

export function SpecialVotesChart({
  votosEspeciales,
  ordenarCategorias,
  stacked,
}: {
  votosEspeciales: any[];
  ordenarCategorias: (a: string, b: string) => number;
  stacked: boolean;
}) {
  const raw = buildChartDataVotosEspeciales(votosEspeciales);
  const data = [...raw].sort((a, b) => ordenarCategorias(String(a.categoria), String(b.categoria)));
  const tipos = getTiposEspecialesUnicos(votosEspeciales).sort((a, b) => a.localeCompare(b));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="categoria" tick={{ dy: 12 }} />
        <YAxis tickLine={false} axisLine={true} />
        <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: "none", zIndex: 0 }} />
        <Legend content={<CustomLegend label="Votos especiales:" />} />
        {tipos.map((tipo) => (
          <Bar key={tipo} dataKey={tipo} stackId={stacked ? "a" : undefined} fill={getColorEspecial(tipo)} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
