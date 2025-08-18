// EstablishmentAccordionItem.tsx
"use client";

import { School } from "lucide-react";
import { useCategoryOrder } from "../../hooks/useCategoryOrder";

import type { EstablishmentVoteSummary } from "./types/EstablishmentVoteSummary";
import { VotesAccordionItem } from "@/app/(dashboard)/components/reports/VotesAccordionItem";

interface EstablishmentAccordionItemProps {
  establishment: EstablishmentVoteSummary;
  stacked: boolean;
  onToggleStacked: () => void;
}

export function EstablishmentAccordionItem({
  establishment,
  stacked,
  onToggleStacked,
}: EstablishmentAccordionItemProps) {
  const { categoryOrder } = useCategoryOrder();

  return (
    <VotesAccordionItem
      value={`establecimiento-${establishment.establecimientoId}`}
      icon={<School width={20} height={20} />}
      title={establishment.establecimiento}
      resumen={establishment.resumen}
      resultados={establishment.resultados}
      votosEspeciales={establishment.votosEspeciales}
      categoryOrder={categoryOrder}
      stacked={stacked}
      onToggleStacked={onToggleStacked}
    />
  );
}
