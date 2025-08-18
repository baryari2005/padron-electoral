// components/reports/VotesAccordionItem/charts/PiesByCategory.tsx
"use client";
import { useMemo } from "react";
import { ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Tooltip } from "recharts";
import { renderPieLabel } from "./pieLabel";
import { renderPercentLabel } from "./renderPercentLaber";
import type { Resultado } from "../types/types";

function buildPiesPorCategoria(resultados: Resultado[]) {
  const byCat = new Map<string, Map<string, number>>();
  resultados.forEach((r) => {
    const cat = (r.categoria ?? "").trim();
    const agr = (r.agrupacion ?? "").trim();
    if (!cat || !agr) return;
    let m = byCat.get(cat);
    if (!m) { m = new Map<string, number>(); byCat.set(cat, m); }
    m.set(agr, (m.get(agr) ?? 0) + (r.votos ?? 0));
  });

  const out: Record<string, { name: string; value: number }[]> = {};
  byCat.forEach((m, cat) => {
    const arr: { name: string; value: number }[] = [];
    m.forEach((value, name) => value > 0 && arr.push({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    out[cat] = arr;
  });
  return out;
}

export function PiesByCategory({
  resultados,
  categoriasOrdenadas,
  colorByAgrupacion,
  /** "pie" = torta sólida, "donut" = dona */
  variant = "pie",
}: {
  resultados: Resultado[];
  categoriasOrdenadas: string[];
  colorByAgrupacion: Map<string, string>;
  variant?: "pie" | "donut";
}) {
  const piesPorCategoria = useMemo(() => buildPiesPorCategoria(resultados), [resultados]);
  const inner = variant === "donut" ? 50 : 0;  // 👈 acá el switch torta/dona

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {categoriasOrdenadas.map((cat) => {
        const data = piesPorCategoria[cat] ?? [];
        if (data.length === 0) {
          return (
            <div key={cat} className="rounded-md border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase text-center">{cat}</p>
              <div className="text-xs text-muted-foreground text-center mt-4">Sin datos</div>
            </div>
          );
        }
        return (
          <div key={cat} className="rounded-md border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase text-center">{cat}</p>
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Tooltip                  
                    formatter={(v: number, n: string) => [`${v} votos`, n]}
                    wrapperStyle={{ pointerEvents: "none" }}
                  />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={variant === "donut" ? 50 : 0}
                    outerRadius={90}
                    //minAngle={5}
                    labelLine={false}
                    //label={renderPieLabel}
                    label={renderPercentLabel}
                  >
                    {data.map((d, i) => (
                      <Cell
                        key={`${cat}-${d.name}-${i}`}
                        fill={colorByAgrupacion.get(d.name) || `hsl(var(--chart-${(i % 5) + 1}))`}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </RPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
