"use client";

import { Accordion } from "@/components/ui/accordion";
import { CircuiteVoteSummary } from "./types/CircuiteVoteSummary";
import { CircuiteAccordionItem } from "./CircuiteAccordionItem";


interface CircuiteAccordionListProps {
  circuites: CircuiteVoteSummary[];
  stacked: boolean;
  onToggleStacked: () => void;
}

export function CircuiteAccordionList({ circuites, stacked, onToggleStacked }: CircuiteAccordionListProps) {
  if (circuites.length === 0) {
    return (
      <div className="text-muted-foreground text-sm px-4 py-2">
        No hay circuitos escrutados disponibles para mostrar.
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-2">
      {circuites.map((circuite) => (
        <CircuiteAccordionItem
          key={circuite.circuitoId}
          circuite={circuite}
          stacked={stacked}
          onToggleStacked={onToggleStacked}
        />
      ))}
    </Accordion>
  );
}
