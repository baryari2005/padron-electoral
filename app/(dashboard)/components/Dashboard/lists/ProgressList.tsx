// components/dashboard/lists/ProgressList.tsx
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgresoItem } from "../types/types";
import { fmtPct } from "@/app/(dashboard)/lib/format";


export type ProgressListProps = {
  title: string;
  items: ProgresoItem[];
  labelKey: "establecimiento" | "circuito";
  limit?: number;
  icono?: LucideIcon;
  iconClassName?: string;
};

export function ProgressList({
  title, items, labelKey, limit = 10, icono: Icon, iconClassName = "w-4 h-4 mr-2",
}: ProgressListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          {Icon && <Icon className={iconClassName} aria-hidden />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.slice(0, limit).map((x, idx) => (
          <div key={`${labelKey}-${idx}`}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium truncate">{(x as any)[labelKey]}</span>
              <span className="text-muted-foreground">
                {x.mesasEscrutadas}/{x.mesasTotales} — {fmtPct(x.porcentaje)}
              </span>
            </div>
            <Progress value={x.porcentaje} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
