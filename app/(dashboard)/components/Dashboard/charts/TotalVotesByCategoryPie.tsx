// components/dashboard/charts/TotalVotesByCategoryPie.tsx
"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { TotalCategoria } from "../types/types";
import { fmtAR } from "@/app/(dashboard)/lib/format";

export function TotalVotesByCategoryPie({
  items,
  donut = true,
}: {
  items: TotalCategoria[];
  donut?: boolean;
}) {
  // ✅ memoizá data en base a items
  const data = useMemo(
    () =>
      items
        .filter((x) => x.votos > 0)
        .map((x) => ({ name: x.categoria, value: x.votos })),
    [items]
  );

  // ✅ memoizá total en base a data
  const total = useMemo(
    () => data.reduce((a, b) => a + b.value, 0),
    [data]
  );

  const innerRadius = donut ? 60 : 0;

  // ✅ dependé de 'data' (no sólo de length)
  const colors = useMemo(() => {
    const len = data.length || 1;
    return data.map((_, i) => `hsl(${Math.round((i * 360) / len)} 70% 45%)`);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Votos totales por categoría</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sin datos para mostrar.</div>
        ) : (
          <div className="h-72 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={innerRadius}
                  outerRadius={90}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((d, i) => (
                    <Cell key={d.name ?? i} fill={colors[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmtAR.format(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            {donut && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-lg font-semibold">{fmtAR.format(total)}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
