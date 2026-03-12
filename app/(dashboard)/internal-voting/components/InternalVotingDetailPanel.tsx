"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GroupByMode, InternalVoter } from "./types";
import { Cargando } from "@/components/ui/upload";
import { ArrowBigLeft, ArrowBigRight, Check, CheckCheck, IdCard, IdCardIcon, School, Sigma, User, UserRoundCheck, Vote } from "lucide-react";

type Props = {
  loading: boolean;
  selectedGroupId: string;
  selectedGroupLabel?: string;
  voters: InternalVoter[];
  groupBy: GroupByMode;
  pendingMap: Map<string, boolean>;
  onToggle: (electorId: string, voted: boolean) => void;
  onMarkAllVoted: (electorIds: string[]) => void;
};

const PAGE_SIZE = 30;

export function InternalVotingDetailPanel({
  loading,
  selectedGroupId,
  selectedGroupLabel,
  voters,
  groupBy,
  pendingMap,
  onToggle,
  onMarkAllVoted,
}: Props) {
  const [page, setPage] = useState(1);

  // const sortedVoters = useMemo(() => {
  //   return [...voters].sort((a, b) => {
  //     const oa = Number(a.numeroOrden ?? 999999);
  //     const ob = Number(b.numeroOrden ?? 999999);
  //     return oa - ob;
  //   });
  // }, [voters]);

  const sortedVoters = useMemo(() => {
    return [...voters].sort((a, b) => {
      const aPending = pendingMap.get(a.id);
      const bPending = pendingMap.get(b.id);

      const aVoted =
        typeof aPending === "boolean" ? aPending : Boolean(a.votoSiNo);
      const bVoted =
        typeof bPending === "boolean" ? bPending : Boolean(b.votoSiNo);

      // Primero los que NO votaron, al final los que SÍ votaron
      if (aVoted !== bVoted) {
        return Number(aVoted) - Number(bVoted);
      }

      // Dentro de cada grupo, ordenar por número de orden
      const oa = Number(a.numeroOrden ?? 999999);
      const ob = Number(b.numeroOrden ?? 999999);

      return oa - ob;
    });
  }, [voters, pendingMap]);

  const totalPages = Math.max(1, Math.ceil(sortedVoters.length / PAGE_SIZE));

  const pagedVoters = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedVoters.slice(start, start + PAGE_SIZE);
  }, [sortedVoters, page]);

  useEffect(() => {
    setPage(1);
  }, [selectedGroupId]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const stats = useMemo(() => {
    let voted = 0;
    let notVoted = 0;

    for (const voter of sortedVoters) {
      const pendingValue = pendingMap.get(voter.id);
      const currentValue =
        typeof pendingValue === "boolean" ? pendingValue : Boolean(voter.votoSiNo);

      if (currentValue) voted++;
      else notVoted++;
    }

    return {
      total: sortedVoters.length,
      voted,
      notVoted,
    };
  }, [sortedVoters, pendingMap]);

  if (loading) {
    return (
      <Card className="p-4">
        <Cargando label="Cargando votantes..." />
      </Card>
    );
  }

  if (!selectedGroupId) {
    return (
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">
          Seleccioná un grupo para ver el detalle.
        </div>
      </Card>
    );
  }

  if (!sortedVoters.length) {
    return (
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">
          No hay votantes para el grupo seleccionado.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        {/* <div>
          <h2 className="text-lg font-medium">
            Detalle del grupo seleccionado</h2>
          <p className="text-sm text-muted-foreground">
            Agrupado por: {groupBy} Grupo: <{selectedGroupId} - {selectedGroupLabel || selectedGroupId}
          </p>
          {stats.total > PAGE_SIZE && (
            <p className="text-xs text-muted-foreground mt-1">
              Mostrando de a {PAGE_SIZE} registros por página.
            </p>
          )}
        </div> */}
        <div className="space-y-1">
          <h2 className="text-lg font-medium">Detalle del grupo seleccionado</h2>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-md border px-2 py-1 text-xs font-medium">
              Agrupado por: {groupBy}
            </span>

            {(selectedGroupLabel || selectedGroupId) && (
              <span className="text-muted-foreground">
                Grupo: {selectedGroupLabel || selectedGroupId}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-md border px-3 py-2 min-w-[100px]">
              <div className="text-muted-foreground flex gap-2">Total:
                <p className="font-semibold text-blue-600">{stats.total}</p></div>
            </div>
            <div className="rounded-md border px-3 py-2 min-w-[100px]">
              <div className="text-muted-foreground flex gap-2">Votaron:
                <p className="font-semibold text-green-600">{stats.voted}</p>
              </div>
            </div>
            <div className="rounded-md border px-3 py-2 min-w-[100px]">
              <div className="text-muted-foreground flex gap-2">No votaron:
                <p className="font-semibold text-red-600">{stats.notVoted}</p>
              </div>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => onMarkAllVoted(sortedVoters.map((v) => v.id))}
            className="w-full lg:w-auto" >
            <CheckCheck className="w-4 h-4" />Marcar todo el grupo como votado
          </Button>
        </div>
      </div>

      {
        totalPages > 1 && (
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
              {stats.total > PAGE_SIZE && (
                <p className="text-xs text-muted-foreground mt-1 animate-pulse">
                  Mostrando de a {PAGE_SIZE} registros por página.
                </p>
              )}

            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                <ArrowBigLeft className="w-4 h-4" />
                Anterior
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Siguiente
                <ArrowBigRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )
      }

      <div className="space-y-2">
        {pagedVoters.map((voter) => {
          const pendingValue = pendingMap.get(voter.id);
          const currentVoted =
            typeof pendingValue === "boolean" ? pendingValue : Boolean(voter.votoSiNo);

          const isPending = typeof pendingValue === "boolean";

          return (
            <div
              key={voter.id}
              className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-md border px-2 py-0.5 text-xs font-medium justify-center">
                    <School className="w-4 h-4 mr-2" /> {voter.establecimientoNombre ?? "-"}
                  </span>

                  <span className="inline-flex rounded-md border px-2 py-0.5 text-xs font-medium">
                    Orden {voter.numeroOrden ?? "-"}
                  </span>


                  {voter.numeroPlanilla && (
                    <span className="inline-flex rounded-md border px-2 py-0.5 text-xs">
                      Planilla {voter.numeroPlanilla}
                    </span>
                  )}

                  {isPending && (
                    <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Pendiente de confirmación
                    </span>
                  )}
                </div>

                <div className="font-medium break-words flex items-center">
                  <IdCard className="w-4 h-4 mr-2" />{voter.apellido}, {voter.nombre} <span className="font-xs text-muted-foreground ml-2"> - DNI: {voter.dni ?? "-"} </span>
                </div>

                {/* <div className="text-sm text-muted-foreground break-words">
                  DNI: {voter.dni ?? "-"}
                </div> */}

                {voter.telefono && (
                  <div className="text-xs text-muted-foreground break-words">
                    Tel: {voter.telefono}
                  </div>
                )}

                {(voter.referente || voter.planillero) && (
                  <div className="text-xs text-muted-foreground break-words">
                    {voter.referente ? `Referente: ${voter.referente}` : ""}
                    {voter.referente && voter.planillero ? " | " : ""}
                    {voter.planillero ? `Planillero: ${voter.planillero}` : ""}
                    {voter.planillero && voter.referente ? " | " : ""}
                    {voter.chofer ? `Chofer: ${voter.chofer}` : ""}
                  </div>
                )}

                {voter.nombrePlanilla && (
                  <div className="text-xs text-muted-foreground break-words">
                    Nombre planilla: {voter.nombrePlanilla}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  className={
                    currentVoted
                      ? "border-green-600 bg-green-600 text-white hover:bg-green-700 hover:border-green-700"
                      : ""
                  }
                  variant="outline"
                  onClick={() => onToggle(voter.id, true)}
                >
                  <Vote className="w-4 h-4" />
                  Votó
                </Button>

                <Button
                  type="button"
                  variant={!currentVoted ? "destructive" : "outline"}
                  onClick={() => onToggle(voter.id, false)}
                >
                  No votó
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card >
  );
}