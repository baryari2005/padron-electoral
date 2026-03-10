"use client";

import { Card } from "@/components/ui/card";
import { InternalVotingStats as InternalVotingStatsType } from "./types";

type Props = {
  stats: InternalVotingStatsType;
};

export function InternalVotingStats({ stats }: Props) {
  const participation =
    stats.total > 0 ? Math.round((stats.voted / stats.total) * 100) : 0;

  const items = [
    { label: "Total", value: stats.total },
    { label: "Votaron", value: stats.voted },
    { label: "No votaron", value: stats.notVoted },
    { label: "Pendientes sin guardar", value: stats.pending },
    { label: "% participación", value: `${participation}%` },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label} className="p-4">
          <div className="text-sm text-muted-foreground">{item.label}</div>
          <div className="text-2xl font-semibold">{item.value}</div>
        </Card>
      ))}
    </div>
  );
}