"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCheck, School } from "lucide-react";
import { InternalGraphicVoter, searchStats } from "./types";
import { IconAzul, IconRojo, IconVerde } from "../../electoral-rolls/quick-marking/components/icons/VoterIcons";

type Props = {
  voters: InternalGraphicVoter[];
  searchStats: searchStats;
  currentReferenteLabel: string;
  currentPlanilleroLabel: string;
  currentPlanillaLabel: string;
  hasAnchorFilter: boolean,
  pendingMap: Map<string, boolean>;
  onToggle: (electorId: string, voted: boolean) => void;
  onMarkAllVoted: (electorIds: string[]) => void;
};

export function InternalVotingGraphicGrid({
  voters,
  searchStats,
  currentReferenteLabel,
  currentPlanilleroLabel,
  currentPlanillaLabel,
  hasAnchorFilter,
  pendingMap,
  onToggle,
  onMarkAllVoted,
}: Props) {
  const sortedVoters = useMemo(() => {
    return [...voters].sort((a, b) => {
      const aPending = pendingMap.get(a.id);
      const bPending = pendingMap.get(b.id);

      const aVoted =
        typeof aPending === "boolean" ? aPending : Boolean(a.votoSiNo === "S" || a.votoSiNo === true || a.votedAt);
      const bVoted =
        typeof bPending === "boolean" ? bPending : Boolean(b.votoSiNo === "S" || b.votoSiNo === true || b.votedAt);

      if (aVoted !== bVoted) {
        return Number(aVoted) - Number(bVoted);
      }

      const planillaA = String(a.numeroPlanilla ?? "999999");
      const planillaB = String(b.numeroPlanilla ?? "999999");
      const byPlanilla = planillaA.localeCompare(planillaB, "es", { numeric: true, sensitivity: "base" });
      if (byPlanilla !== 0) return byPlanilla;

      const estabA = a.establecimientoNombre ?? "";
      const estabB = b.establecimientoNombre ?? "";
      const byEstab = estabA.localeCompare(estabB, "es", { sensitivity: "base" });
      if (byEstab !== 0) return byEstab;

      const mesaA = Number(a.mesaNumero ?? 999999);
      const mesaB = Number(b.mesaNumero ?? 999999);
      if (mesaA !== mesaB) return mesaA - mesaB;

      const ordenA = Number(a.numeroOrden ?? 999999);
      const ordenB = Number(b.numeroOrden ?? 999999);
      return ordenA - ordenB;
    });
  }, [voters, pendingMap]);

  if (!sortedVoters.length) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        No hay votantes para los filtros seleccionados.
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {hasAnchorFilter && (            
              <div className="grid items-start gap-3 text-sm md:grid-cols-2 xl:grid-cols-7">
                <div className="rounded-md border px-3 py-2">
                  <span className="text-muted-foreground">Referente: </span>
                  <span className="font-medium">{currentReferenteLabel}</span>
                </div>

                <div className="rounded-md border px-3 py-2">
                  <span className="text-muted-foreground">Planillero: </span>
                  <span className="font-medium">{currentPlanilleroLabel}</span>
                </div>

                <div className="rounded-md border px-3 py-2">
                  <span className="text-muted-foreground">Planilla: </span>
                  <span className="font-medium">{currentPlanillaLabel}</span>
                </div>

                <div className="ml-10"></div>

                <div className="rounded-md border px-3 py-2">
                  <span className="text-muted-foreground">Total: </span>
                  <span className="font-bold text-blue-600 text-xl ml-4">{searchStats.total}</span>
                </div>

                <div className="rounded-md border px-3 py-2">
                  <span className="text-muted-foreground">Votaron: </span>
                  <span className="font-bold text-green-600 text-xl ml-4">{searchStats.voted}</span>
                </div>

                <div className="rounded-md border px-3 py-2">
                  <span className="text-muted-foreground">No votaron: </span>
                  <span className="font-bold text-red-600 text-xl ml-4">{searchStats.notVoted}</span>
                </div>
              </div>            
          )}
        </div>

        <Button
          type="button"
          onClick={() => onMarkAllVoted(sortedVoters.map((x) => x.id))}
        >
          <CheckCheck className="w-4 h-4" />
          Marcar todo como votado
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedVoters.map((voter) => {
          const pendingValue = pendingMap.get(voter.id);
          const currentVoted =
            typeof pendingValue === "boolean"
              ? pendingValue
              : Boolean(voter.votoSiNo === "S" || voter.votoSiNo === true || voter.votedAt);

          const serverVoted = Boolean(voter.votoSiNo === "S" || voter.votoSiNo === true || voter.votedAt);
          const dirty = typeof pendingValue === "boolean" && pendingValue !== serverVoted;

          const Icon = dirty ? IconAzul : currentVoted ? IconVerde : IconRojo;

          return (
            <button
              key={voter.id}
              type="button"
              onClick={() => onToggle(voter.id, !currentVoted)}
              className="rounded-xl border p-3 text-left transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <div className="font-medium truncate">
                    {voter.apellido}, {voter.nombre}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    DNI: {voter.dni ?? "-"}
                  </div>
                </div>

                <Icon className="h-6 w-6 shrink-0" />
              </div>

              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <div>Planilla: {voter.numeroPlanilla ?? "-"}</div>
                <div>Referente: {voter.referente ?? "-"}</div>
                <div>Planillero: {voter.planillero ?? "-"}</div>
                <div className="flex items-center gap-1">
                  <School className="w-3 h-3" />
                  {voter.establecimientoNombre ?? "-"} - Mesa {voter.mesaNumero ?? "-"}
                </div>
                <div>Orden: {voter.numeroOrden ?? "-"}</div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}