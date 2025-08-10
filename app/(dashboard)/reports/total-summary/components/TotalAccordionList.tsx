"use client";

import { Accordion } from "@/components/ui/accordion";
import { TotalVoteSummary } from "./types/TotalVoteSummary";
import { TotalAccordionItem } from "./TotalAccordionItem";


interface TotalAccordionListProps {
  total: TotalVoteSummary;
  stacked: boolean;
  onToggleStacked: () => void;
}

export function TotalAccordionList({ total, stacked, onToggleStacked }: TotalAccordionListProps) {
  if (
    total.resultados.length === 0 &&
    total.votosEspeciales.length === 0
  ) {
    return (
      <div className="text-muted-foreground text-sm px-4 py-2">
        No hay datos disponibles para mostrar.
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-2">
      <TotalAccordionItem
        key={1}
        total={total}
        stacked={stacked}
        onToggleStacked={onToggleStacked}
      />
    </Accordion>
  );
}
