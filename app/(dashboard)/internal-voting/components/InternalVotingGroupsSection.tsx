import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GroupSummary } from "./types";
import { InternalVotingSummaryCards } from "./InternalVotingSummaryCards";
import { Cargando } from "@/components/ui/upload";

type Props = {
  groupsCollapsed: boolean;
  onToggleCollapsed: () => void;
  loadingSummary: boolean;
  summaryItems: GroupSummary[];
  selectedGroupId: string;
  onSelectGroup: (groupId: string) => void;
};

export function InternalVotingGroupsSection({
  groupsCollapsed,
  onToggleCollapsed,
  loadingSummary,
  summaryItems,
  selectedGroupId,
  onSelectGroup,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg">Resumen por grupo</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2 animate-pulse">
            <Info className="w-4 h-4"/>Elegí un grupo para cargar solo ese subconjunto de electores.
          </p>
        </div>

        <Button type="button" variant="outline" onClick={onToggleCollapsed}>
          {groupsCollapsed ? (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Expandir grupos
            </>
          ) : (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Colapsar grupos
            </>
          )}
        </Button>
      </div>

      {!groupsCollapsed &&
        (loadingSummary ? (
          <Card className="p-8 text-center text-muted-foreground">
            <Cargando label="Cargando resumen..."/>
          </Card>
        ) : (
          <InternalVotingSummaryCards
            items={summaryItems}
            selectedGroupId={selectedGroupId}
            onSelect={onSelectGroup}
          />
        ))}
    </div>
  );
}