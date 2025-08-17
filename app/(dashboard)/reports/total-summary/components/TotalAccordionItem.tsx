// components/reports/TotalAccordionItem.tsx
"use client";

import { MapPinned } from "lucide-react";
import { useCategoryOrder } from "../../hooks/useCategoryOrder";

import type { TotalVoteSummary } from "./types/TotalVoteSummary";
import { VotesAccordionItem } from "@/app/(dashboard)/components/reports/VotesAccordionItem";

export function TotalAccordionItem({
  total,
  stacked,
  onToggleStacked,
  value,
}: {
  total: TotalVoteSummary;
  stacked: boolean;
  onToggleStacked: () => void;
  value: string;
}) {
  const { categoryOrder } = useCategoryOrder();

  return (
    <VotesAccordionItem
      value={`total-${value}`}
      icon={<MapPinned width={20} height={20} />}
      title={"Votación general"}
      resumen={total.resumen}
      resultados={total.resultados}
      votosEspeciales={total.votosEspeciales}
      categoryOrder={categoryOrder}
      stacked={stacked}
      onToggleStacked={onToggleStacked}
    />
  );
}
