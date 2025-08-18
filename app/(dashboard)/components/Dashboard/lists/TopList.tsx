// components/dashboard/lists/TopList.tsx
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fmtAR } from "@/app/(dashboard)/lib/format";
import { TopItem } from "../types/types";

export type TopListProps = {
  title: string;
  items: TopItem[];
  labelKey: "establecimiento" | "circuito";
  icono?: LucideIcon;
  iconClassName?: string;
};

export function TopList({ title, items, labelKey, icono: Icon, iconClassName = "w-4 h-4 mr-2" }: TopListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          {Icon && <Icon className={iconClassName} aria-hidden />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal pl-4 space-y-1">
          {items.map((x, i) => (
            <li key={`${labelKey}-${i}`} className="flex justify-between">
              <span className="truncate">{(x as any)[labelKey]}</span>
              <span className="text-muted-foreground">{fmtAR.format(x.votos)} votos</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
