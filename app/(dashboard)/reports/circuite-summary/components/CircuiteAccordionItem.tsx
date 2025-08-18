"use client";

import { VotesAccordionItem } from "@/app/(dashboard)/components/reports/VotesAccordionItem";
import { useCategoryOrder } from "../../hooks/useCategoryOrder";
import { School } from "lucide-react";
import { CircuiteVoteSummary } from "./types/CircuiteVoteSummary";

interface CircuiteAccordionItemProps {
  circuite: CircuiteVoteSummary;
  stacked: boolean;
  onToggleStacked: () => void;
}

export function CircuiteAccordionItem({
  circuite,
  stacked,
  onToggleStacked,
}: CircuiteAccordionItemProps) {


const { categoryOrder } = useCategoryOrder();

  return (
    <VotesAccordionItem
      value={`circuito-${circuite.circuitoId}`}
      icon={<School width={20} height={20} />}
      title={
        <>
        {circuite.circuitoId} - {circuite.circuito}
        </>
      }
      resumen={circuite.resumen}
      resultados={circuite.resultados}
      votosEspeciales={circuite.votosEspeciales}
      categoryOrder={categoryOrder}
      stacked={stacked}
      onToggleStacked={onToggleStacked}
    />
  );
}
