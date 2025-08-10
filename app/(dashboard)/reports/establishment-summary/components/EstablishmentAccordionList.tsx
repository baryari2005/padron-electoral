"use client";

import { Accordion } from "@/components/ui/accordion";
import { EstablishmentVoteSummary } from "./types/EstablishmentVoteSummary";
import { EstablishmentAccordionItem } from "./EstablishmentAccordionItem";


interface EstablishmentAccordionListProps {
  establishments: EstablishmentVoteSummary[];
  stacked: boolean;
  onToggleStacked: () => void;
}

export function EstablishmentAccordionList({ establishments, stacked, onToggleStacked }: EstablishmentAccordionListProps) {
  if (establishments.length === 0) {
    return (
      <div className="text-muted-foreground text-sm px-4 py-2">
        No hay establecimientos escrutados disponibles para mostrar.
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-2">
      {establishments.map((establishment) => (
        <EstablishmentAccordionItem
          key={establishment.establecimientoId}
          establishment={establishment}
          stacked={stacked}
          onToggleStacked={onToggleStacked}
        />
      ))}
    </Accordion>
  );
}
