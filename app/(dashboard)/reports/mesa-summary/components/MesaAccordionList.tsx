"use client";

import { Accordion } from "@/components/ui/accordion";
import { MesaAccordionItem } from "./MesaAccordionItem";
import { MesaVoteSummary } from "./types";

interface MesaAccordionListProps {
  mesas: MesaVoteSummary[];
  stacked: boolean;
  onToggleStacked: () => void;
}

export function MesaAccordionList({ mesas, stacked, onToggleStacked }: MesaAccordionListProps) {
  if (mesas.length === 0) {
    return (
      <div className="text-muted-foreground text-sm px-4 py-2">
        No hay mesas escrutadas disponibles para mostrar.
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-2">
      {mesas.map((mesa) => (
        <MesaAccordionItem
          key={mesa.mesaId}
          mesa={mesa}
          stacked={stacked}
          onToggleStacked={onToggleStacked}
        />
      ))}
    </Accordion>
  );
}
