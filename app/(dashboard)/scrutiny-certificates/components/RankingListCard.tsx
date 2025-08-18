"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RankItem } from "../hooks/useRankingsFromSummary";


const nf = (n: number) => n.toLocaleString("es-AR");
const pf = (n: number) => `${n.toFixed(1)}%`;

export function RankingListCard({ title, items }: { title: string; items: RankItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((it, i) => (
          <div key={it.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-6">{i + 1}.</span>
              <span className="font-medium">{it.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{pf(it.percent)}</span>
              <span className="font-semibold">{nf(it.value)} votos</span>
            </div>
          </div>
        ))}
        {!items.length && <div className="text-xs text-muted-foreground">Sin datos.</div>}
      </CardContent>
    </Card>
  );
}
