"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";
import { Form } from "@/components/ui/form";

import {
  InternalVotingStats as InternalVotingStatsType,
} from "./components/types";

import { InternalVotingFilters } from "./components/InternalVotingFilters";
import { InternalVotingStats } from "./components/InternalVotingStats";
import { InternalVotingDetailPanel } from "./components/InternalVotingDetailPanel";
import { useInternalVotingForm } from "./hooks/useInternalVotingForm";
import { useInternalVotingPending } from "./hooks/useInternalVotingPending";
import { useInternalVotingOptions } from "./hooks/useInternalVotingOptions";
import { useInternalVotingSummary } from "./hooks/useInternalVotingSummary";
import { useInternalVotingVoters } from "./hooks/useInternalVotingVoters";
import { buildInternalVotingStats } from "./utils/internalVoting.utils";
import { saveInternalVotingBatch } from "./services/internalVoting.service";
import { InternalVotingHeader } from "./components/InternalVotingHeader";
import { InternalVotingGroupsSection } from "./components/InternalVotingGroupsSection";
import { useActiveElection } from "@/hooks/useActiveElection";
import { StatusPage } from "@/components/status/StatusPage";
import { CarryingSpinner } from "@/components/ui/CarryingSpinner";


export default function InternalVotingPage() {
  const canView = useHasPermission("ver_estadoelector");
  const canEdit = useHasPermission("editar_estadoelector");
  const { electionType, loading, hasActive } = useActiveElection();

  const { form, values } = useInternalVotingForm();
  const {
    establecimientoId,
    mesaId,
    query,
    groupBy,
    referenteId,
    planilleroId,
  } = values;

  const {
    pendingMarks,
    pendingMap,
    setPendingMarks,
    resetPending,
    upsertPending,
    markAllCurrentGroupAsVoted,
  } = useInternalVotingPending();

  const [refreshToken, setRefreshToken] = useState(0);
  const [groupsCollapsed, setGroupsCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSearch = true;

  const setMesaId = useCallback(
    (value: string) => form.setValue("mesaId", value),
    [form]
  );

  const setPlanilleroId = useCallback(
    (value: string) => form.setValue("planilleroId", value),
    [form]
  );

  function triggerRefresh() {
    setRefreshToken((x) => x + 1);
  }

  const {
    establecimientos,
    mesas,
    referentes,
    planilleros,
    loadingEstabs,
    loadingMesas,
    loadingPersons,
  } = useInternalVotingOptions({
    canView,
    establecimientoId,
    referenteId,
    // planilleroId,
    mesaId,
    setMesaId,
    setPlanilleroId,
  });

  const {
    summaryItems,
    selectedGroupId,
    setSelectedGroupId,
    loadingSummary,
  } = useInternalVotingSummary({
    canView,
    canSearch,
    establecimientoId,
    mesaId,
    referenteId,
    planilleroId,
    groupBy,
    query,
    refreshToken,
  });

  const { selectedGroupVoters, loadingVoters } = useInternalVotingVoters({
    canView,
    canSearch,
    establecimientoId,
    mesaId,
    referenteId,
    planilleroId,
    groupBy,
    selectedGroupId,
    query,
    refreshToken,
  });

  const stats: InternalVotingStatsType = useMemo(() => {
    return buildInternalVotingStats(summaryItems, pendingMarks);
  }, [summaryItems, pendingMarks]);

  async function handleSave() {
    if (!pendingMarks.length) return;

    try {
      setSaving(true);

      await saveInternalVotingBatch({
        mesaId: mesaId || null,
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

  if (loading) 
    return <CarryingSpinner variant="fullscreen" label="Cargando estado de votación..."/>;

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
        <InternalVotingHeader
          pendingCount={pendingMarks.length}
          canEdit={canEdit}
          saving={saving}
          onDiscard={() => {
            resetPending();
            triggerRefresh();
          }}
          onSave={handleSave}
        />

        <InternalVotingFilters
          control={form.control}
          setValue={form.setValue}
          establecimientos={establecimientos}
          mesas={mesas}
          referentes={referentes}
          planilleros={planilleros}
          loadingEstabs={loadingEstabs}
          loadingMesas={loadingMesas}
          loadingPersons={loadingPersons}
          loadingSearch={loadingSummary || loadingVoters}
          onRefresh={triggerRefresh}
          onResetPending={resetPending}
        />

        <InternalVotingStats stats={stats} />

        <InternalVotingGroupsSection
          groupsCollapsed={groupsCollapsed}
          onToggleCollapsed={() => setGroupsCollapsed((prev) => !prev)}
          loadingSummary={loadingSummary}
          summaryItems={summaryItems}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
        />

        <InternalVotingDetailPanel
          loading={loadingVoters}
          selectedGroupId={selectedGroupId}
          selectedGroupLabel={
            summaryItems.find((item) => item.id === selectedGroupId)?.label
          }
          voters={selectedGroupVoters}
          groupBy={groupBy}
          pendingMap={pendingMap}
          onToggle={upsertPending}
          onMarkAllVoted={markAllCurrentGroupAsVoted}
        />
      </div>
    </Form>
  );
}


