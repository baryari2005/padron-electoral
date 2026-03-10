"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GroupSummary } from "./types";
import { Group, Percent, PercentDiamond } from "lucide-react";

type Props = {
  items: GroupSummary[];
  selectedGroupId: string;
  onSelect: (groupId: string) => void;
};

export function InternalVotingSummaryCards({
  items,
  selectedGroupId,
  onSelect,
}: Props) {
  if (!items.length) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        No hay grupos para mostrar con los filtros actuales.
      </Card>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const percent = item.total > 0 ? Math.round((item.voted / item.total) * 100) : 0;

        return (
          <Card
            key={item.id}
            className={cn(
              "p-4 cursor-pointer transition-all hover:border-primary",
              selectedGroupId === item.id && "border-primary ring-1 ring-primary"
            )}
            onClick={() => onSelect(item.id)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Group className="w-4 h-4" />
                    Grupo: <span className="font-bold">{item.label}</span>
                  </p>
                </div>
                <div className="text-sm font-medium">
                  <p className="text-sm flex items-center gap-2">
                    {percent}<Percent className="w-4 h-4" />
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium">{item.total}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Votó</p>
                  <p className="font-medium text-green-600">{item.voted}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">No votó</p>
                  <p className="font-medium text-red-600">{item.notVoted}</p>
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-green-600"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}