"use client";

import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { useState } from "react";
import { DialogCrudEntity } from "../components";
import { Vote } from "lucide-react";
import { ElectionList, FormElection } from "./components";
import { useActiveElection } from "@/hooks/useActiveElection";
import { StatusPage } from "@/components/status/StatusPage";

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
  const components = "Elecciones";
  const component = "Elección";

  const { loading, hasActive } = useActiveElection();

  const canView = useHasPermission("ver_elecciones");
  const canCreate = useHasPermission("crear_elecciones");
  const canEdit = useHasPermission("editar_elecciones");
  const canDelete = useHasPermission("eliminar_elecciones");

    if (loading) return null;
  
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

  if (!canView) {
    return <AccessDeniedPage subtitle="Ver Elecciones." />
  }

  return (
    <div className="space-y-4">
      {/* Título y botón */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Listado de {components}</h2>
        {canCreate && (
          <DialogCrudEntity
            open={open}
            setOpen={setOpen}
            iconButton={<Vote className="w-5 h-5 text-white" />}
            iconModal={<Vote className="w-5 h-5 text-muted-foreground" />}
            titleCreate={`Crear ${component}`}
            titleUpdate={`Editar ${component}`}
            description={`Crear y configurar una nueva ${component}`}
            mode="create"
            buttonTextCreate={`Nueva ${component}`}
            buttonTextUpdate={`Editar ${component}`}
          >
            <FormElection
              onSuccess={handleSuccess}
              onClose={handleClose}
            />
          </DialogCrudEntity>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow space-y-2">
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
  );
}