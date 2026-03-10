"use client";

import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { useState } from "react";
import { Vote } from "lucide-react";
import { ElectionList, FormElection } from "./components";
import { DialogCrudEntity } from "@/app/(dashboard)/components";

export default function ElectionsPage() {
  const [refresh, setRefresh] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const handleRefresh = () => setRefresh((prev) => !prev);
  const handleSuccess = () => {
    handleRefresh();
    setOpen(false);
  };

  const handleClose = () => setOpen(false);

  const canView = useHasPermission("ver_elecciones");
  const canCreate = useHasPermission("crear_elecciones");
  const canEdit = useHasPermission("editar_elecciones");
  const canDelete = useHasPermission("eliminar_elecciones");

  if (!canView) {
    return <AccessDeniedPage subtitle="Ver Elecciones." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Elecciones
          </h1>
          <p className="text-sm text-muted-foreground">
            Administra, crea y activa las elecciones del sistema.
          </p>
        </div>

        {canCreate && (
          <DialogCrudEntity
            open={open}
            setOpen={setOpen}
            iconButton={<Vote className="w-5 h-5 text-white" />}
            iconModal={<Vote className="w-5 h-5 text-muted-foreground" />}
            titleCreate="Crear Elección"
            titleUpdate="Editar Elección"
            description="Configura una nueva elección en el sistema."
            mode="create"
            buttonTextCreate="Nueva Elección"
            buttonTextUpdate="Editar Elección"
          >
            <FormElection
              onSuccess={handleSuccess}
              onClose={handleClose}
            />
          </DialogCrudEntity>
        )}
      </div>

      {/* Card Container */}
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="p-6 space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Filtrar por nombre o tipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* List */}
          <ElectionList
            key={String(refresh) + search}
            search={search}
            onDeleted={handleRefresh}
            refresh={refresh}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </div>
      </div>
    </div>
  );
}