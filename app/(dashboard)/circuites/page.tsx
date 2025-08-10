"use client";

import { useState } from "react";
import { DialogCrudEntity } from "../components/DialogCreateEntity";
import { FormCircuit } from "./components/CircuitForm";
import { CircuitList } from "./components/CircuitList";
import { MapPinned } from "lucide-react";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";

export default function CircuitesPage() {
  const [refresh, setRefresh] = useState(false);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const handleRefresh = () => setRefresh((prev) => !prev);
  const handleSuccess = () => {
    handleRefresh();
    setOpen(false);
  };
  const handleClose = () => setOpen(false);

  const components = "Circuitos";
  const component = "Circuito";

  const canView = useHasPermission("ver_circuitos");
  const canCreate = useHasPermission("crear_circuitos");
  const canEdit = useHasPermission("editar_circuitos");
  const canDelete = useHasPermission("eliminar_circuitos");

  if (!canView) {
    return <AccessDeniedPage />
  }

  return (
    <div className="space-y-4">
      {/* Título y botón */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Listado de {component}s</h2>
        {canCreate && (
          <DialogCrudEntity
            open={open}
            setOpen={setOpen}
            iconButton={<MapPinned className="w-5 h-5 text-white" />}
            iconModal={<MapPinned className="w-5 h-5 text-muted-foreground" />}
            titleCreate={`Crear ${component}`}
            titleUpdate={`Editar ${component}`}
            description={`Crear y configurar una nuevo ${component}`}
            mode="create"
            buttonTextCreate={`Nuevo ${component}`}
            buttonTextUpdate={`Editar ${component}`}
          >
            <FormCircuit
              onSuccess={handleSuccess}
              onClose={handleClose}
            />
          </DialogCrudEntity>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow space-y-2">
        <CircuitList
          key={String(refresh) + search}
          search={search}
          onDeleted={handleRefresh}
          refresh={refresh}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>
    </div>
  );
}
