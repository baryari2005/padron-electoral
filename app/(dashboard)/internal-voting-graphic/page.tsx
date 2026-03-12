"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { useActiveElection } from "@/hooks/useActiveElection";
import { StatusPage } from "@/components/status/StatusPage";
import { CarryingSpinner } from "@/components/ui/CarryingSpinner";
import { saveInternalVotingBatch } from "../internal-voting/services/internalVoting.service";

import { useInternalVotingGraphicForm } from "./hooks/useInternalVotingGraphicForm";
import { useInternalVotingGraphicOptions } from "./hooks/useInternalVotingGraphicOptions";
import { useInternalVotingGraphicVoters } from "./hooks/useInternalVotingGraphicVoters";
import { InternalVotingGraphicFilters } from "./components/InternalVotingGraphicFilters";
import { InternalVotingGraphicGrid } from "./components/InternalVotingGraphicGrid";
import { PendingMark } from "./components/types";
import { Card } from "@/components/ui/card";
import { Cargando } from "@/components/ui/upload";

export default function InternalVotingGraphicPage() {
    const canView = useHasPermission("ver_estadoelector");
    const canEdit = useHasPermission("editar_estadoelector");
    const { loading, hasActive } = useActiveElection();

    const { form, values } = useInternalVotingGraphicForm();
    const { referenteId, planilleroId, planillaId, query } = values;

    const [refreshToken, setRefreshToken] = useState(0);
    const [pendingMarks, setPendingMarks] = useState<PendingMark[]>([]);
    const [saving, setSaving] = useState(false);

    const { referentes, planilleros, planillas, loadingOptions } =
        useInternalVotingGraphicOptions({
            canView,
            referenteId,
            planilleroId,
        });

    const { voters, loadingVoters } = useInternalVotingGraphicVoters({
        canView,
        referenteId,
        planilleroId,
        planillaId,
        query,
        refreshToken,
    });

    const hasAnchorFilter =
        Boolean(referenteId) ||
        Boolean(planilleroId) ||
        Boolean(planillaId) ||
        (query?.trim().length ?? 0) >= 3;

    const pendingMap = useMemo(() => {
        const map = new Map<string, boolean>();
        for (const item of pendingMarks) {
            map.set(String(item.electorId), item.voted);
        }
        return map;
    }, [pendingMarks]);

    const currentReferenteLabel =
        referentes.find((r) => String(r.id) === String(referenteId))?.nombre ??
        (referenteId ? `ID ${referenteId}` : "Todos");

    const currentPlanilleroLabel =
        planilleros.find((p) => String(p.id) === String(planilleroId))?.nombre ??
        (planilleroId ? `ID ${planilleroId}` : "Todos");

    const currentPlanillaLabel =
        planillas.find((p) => String(p.id) === String(planillaId))?.nombre ??
        (planillaId ? `ID ${planillaId}` : "Todas");

    const searchStats = useMemo(() => {
        let voted = 0;
        let notVoted = 0;

        for (const voter of voters) {
            const pendingValue = pendingMap.get(voter.id);
            const currentValue =
                typeof pendingValue === "boolean" ? pendingValue : Boolean(voter.votoSiNo);

            if (currentValue) voted++;
            else notVoted++;
        }

        return {
            total: voters.length,
            voted,
            notVoted,
        };
    }, [voters, pendingMap]);

    function triggerRefresh() {
        setRefreshToken((x) => x + 1);
    }

    function resetPending() {
        setPendingMarks([]);
    }

    function upsertPending(electorId: string, voted: boolean) {
        setPendingMarks((prev) => {
            const idx = prev.findIndex((x) => String(x.electorId) === String(electorId));
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = { electorId: String(electorId), voted };
                return next;
            }
            return [...prev, { electorId: String(electorId), voted }];
        });
    }

    function markAllCurrentAsVoted(electorIds: string[]) {
        setPendingMarks((prev) => {
            const map = new Map(prev.map((x) => [String(x.electorId), x]));
            for (const id of electorIds) {
                map.set(String(id), { electorId: String(id), voted: true });
            }
            return Array.from(map.values());
        });
    }

    async function handleSave() {
        if (!pendingMarks.length) return;

        try {
            setSaving(true);

            await saveInternalVotingBatch({
                mesaId: null,
                changes: pendingMarks,
            });

            toast.success("Cambios guardados");
            setPendingMarks([]);
            triggerRefresh();
        } catch (error) {
            console.error(error);
            toast.error("No se pudieron guardar los cambios");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <CarryingSpinner variant="fullscreen" label="Cargando..." />;
    }

    if (!hasActive) {
        return (
            <StatusPage
                code="403"
                title="Acceso denegado."
                description="Para acceder a esta sección tiene que existir una elección activa."
                imageSrc="/robot-nea.png"
                primaryAction={{ label: "Ir al inicio", href: "/" }}
            />
        );
    }

    if (!canView || !canEdit) {
        return <AccessDeniedPage subtitle="Ver Electores que votaron." />;
    }

    return (
        <Form {...form}>
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-2xl">Marcación gráfica por filtros</h1>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                resetPending();
                                triggerRefresh();
                            }}
                            disabled={!pendingMarks.length}
                        >
                            Descartar
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSave}
                            loading={saving}
                            loadingText="Guardando..."
                            disabled={!pendingMarks.length}
                        >
                            Guardar cambios {pendingMarks.length ? `(${pendingMarks.length})` : ""}
                        </Button>
                    </div>
                </div>

                <InternalVotingGraphicFilters
                    control={form.control}
                    setValue={form.setValue}
                    referentes={referentes}
                    planilleros={planilleros}
                    planillas={planillas}
                    loadingOptions={loadingOptions}
                    loadingSearch={loadingVoters}
                    onRefresh={triggerRefresh}
                    onResetPending={resetPending}
                />               
                {!hasAnchorFilter ? (
                    <Card className="p-6 text-sm text-muted-foreground">
                        Seleccioná un referente, planillero, planilla o escribí al menos 3 caracteres para buscar.
                    </Card>
                ) : (
                    <InternalVotingGraphicGrid
                        voters={voters}
                        searchStats={searchStats}
                        currentReferenteLabel={currentReferenteLabel}
                        currentPlanilleroLabel={currentPlanilleroLabel}
                        currentPlanillaLabel={currentPlanillaLabel}
                        hasAnchorFilter={hasAnchorFilter}
                        pendingMap={pendingMap}
                        onToggle={upsertPending}
                        onMarkAllVoted={markAllCurrentAsVoted}
                    />
                )}
            </div>
        </Form>
    );
}