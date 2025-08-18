// components/dashboard/lists/ParticipationList.tsx
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParticipacionItem } from "../types/types";
import { fmtAR, fmtPct } from "@/app/(dashboard)/lib/format";


export type ParticipationListProps = {
  title: string;
  items: ParticipacionItem[];
  labelKey: "establecimiento" | "circuito";
  limit?: number;
  icono?: LucideIcon;
  iconClassName?: string;
};

export function ParticipationList({
  title, items, labelKey, limit = 10, icono: Icon, iconClassName = "w-4 h-4 mr-2",
}: ParticipationListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          {Icon && <Icon className={iconClassName} aria-hidden />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.slice(0, limit).map((x, i) => (
            <div key={`${labelKey}-part-${i}`} className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate">{(x as any)[labelKey]}</div>
                <div className="text-xs text-muted-foreground">
                  {fmtAR.format(x.votantes)} / {fmtAR.format(x.padron)} — {fmtPct(x.participacion)}
                </div>
              </div>
              <Badge variant="secondary">{fmtPct(x.participacion)}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
