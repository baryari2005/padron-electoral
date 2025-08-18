// components/reports/mesa-summary/MesaAccordionItem.tsx
"use client";

import { School } from "lucide-react";
import { useCategoryOrder } from "../../hooks/useCategoryOrder";

import { VotesAccordionItem } from "@/app/(dashboard)/components/reports/VotesAccordionItem";
import { MesaVoteSummary } from "./types/MesaVoteSummary";

export function MesaAccordionItem({
  mesa,
  stacked,
  onToggleStacked,
}: {
  mesa: MesaVoteSummary;
  stacked: boolean;
  onToggleStacked: () => void;
}) {
  const { categoryOrder } = useCategoryOrder();

  return (
    <VotesAccordionItem
      value={`mesa-${mesa.mesaId}`}
      icon={<School width={20} height={20} />}
      title={
        <>
          {mesa.establecimiento} — Mesa {mesa.numero}
        </>
      }
      resumen={mesa.resumen}
      resultados={mesa.resultados}
      votosEspeciales={mesa.votosEspeciales}
      categoryOrder={categoryOrder}
      stacked={stacked}
      onToggleStacked={onToggleStacked}
    />
  );
}
