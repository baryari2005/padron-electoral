// components/dashboard/LeadersGrid.tsx
"use client";

import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fmtAR } from "@/app/(dashboard)/lib/format";
import { LiderCategoria } from "./types/types";


export function LeadersGrid({ items }: { items: LiderCategoria[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Líder por categoría</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((x) => (
            <div key={x.categoriaId} className="flex items-center gap-3 rounded-2xl border p-3" style={{ borderColor: `${x.color}55` }}>
              <div className="relative w-10 h-10 shrink-0 rounded-full" style={{ boxShadow: `0 0 0 2px ${x.color}` }}>
                <Image src={x.logo || "/logo-placeholder.png"} alt={x.agrupacion} fill sizes="40px" className="object-contain rounded-full" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{x.categoria}</div>
                <div className="font-semibold truncate" style={{ color: x.color }}>{x.agrupacion}</div>
                <div className="text-xs text-muted-foreground">{fmtAR.format(x.votos)} votos</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
