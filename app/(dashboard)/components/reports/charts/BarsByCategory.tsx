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
import { createCustomLogoTick, CustomTooltip, CustomLegend } from "@/app/(dashboard)/reports/components";
import { getColor } from "../utils/chartUtils";

export function BarsByCategory({
  chartData,
  categoriasOrdenadas,
  stacked,
}: {
  chartData: any[];
  categoriasOrdenadas: string[];
  stacked: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="agrupacion" tick={createCustomLogoTick(chartData)} interval={0} height={40} />
        <YAxis tickLine={false} axisLine={true} />
        <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: "none", zIndex: 0 }} />
        <Legend content={<CustomLegend label="Cargos políticos:" />} />
        {categoriasOrdenadas.map((cat) => (
          <Bar key={cat} dataKey={cat} stackId={stacked ? "a" : undefined} fill={getColor(cat)} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
