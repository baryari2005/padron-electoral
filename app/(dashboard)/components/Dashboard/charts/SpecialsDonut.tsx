// components/dashboard/charts/SpecialsDonut.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

import { Separator } from "@/components/ui/separator";
import { SPECIALS_COLORS } from "@/app/(dashboard)/constants/colors";
import { fmtAR, fmtPct } from "@/app/(dashboard)/lib/format";

export function SpecialsDonut({
  data, total, pctSobreVotantes,
}: { data: { name: string; value: number }[]; total: number; pctSobreVotantes: number; }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Votos especiales</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 items-center">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} strokeWidth={0}>
                  {data.map((_, i) => <Cell key={i} fill={SPECIALS_COLORS[i % SPECIALS_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-semibold">{fmtAR.format(total)} votos</div>
            <div className="text-sm text-muted-foreground">{fmtPct(pctSobreVotantes)} del total de votantes</div>
            <Separator className="my-2" />
            <ul className="space-y-1 text-sm">
              {data.map((d, i) => (
                <li key={i} className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: SPECIALS_COLORS[i % SPECIALS_COLORS.length] }} />
                    {d.name}
                  </span>
                  <span className="text-muted-foreground">{fmtAR.format(d.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
