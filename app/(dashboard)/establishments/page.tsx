"use client";

import { useState } from "react";
import { DialogCrudEntity } from "../components/DialogCreateEntity";

import { FormEstablishment } from "./components/EstablishmentForm";
import { EstablishmentsList } from "./components/EstablishmentList";
import { School } from "lucide-react";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";
import { useActiveElection } from "@/hooks/useActiveElection";
import { StatusPage } from "@/components/status/StatusPage";

export default function EstablishmentsPage() {
  const [refresh, setRefresh] = useState(false);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const handleRefresh = () => setRefresh((prev) => !prev);
  const handleSuccess = () => {
    handleRefresh();
    setOpen(false);
  };
  const handleClose = () => setOpen(false);
  const components = "Establecimientos";
  const component = "Establecimiento";

  const canView = useHasPermission("ver_establecimientos");
  const canCreate = useHasPermission("crear_establecimientos");
  const canEdit = useHasPermission("editar_establecimientos");
  const canDelete = useHasPermission("eliminar_establecimientos");

  const { loading, hasActive } = useActiveElection();

  if (!canView) return (<AccessDeniedPage subtitle="Ver Establecimientos." />);


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

  return (
    <div className="space-y-4">
      {/* Título y botón */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Listado de {component}s</h2>
        {canCreate && (
          <DialogCrudEntity
            open={open}
            setOpen={setOpen}
            iconButton={<School className="w-5 h-5 text-white" />}
            iconModal={<School className="w-5 h-5 text-muted-foreground" />}
            titleCreate={`Crear ${component}`}
            titleUpdate={`Editar ${component}`}
            description={`Crear y configurar un nuevo ${component}`}
            mode="create"
            buttonTextCreate={`Nuevo ${component}`}
            buttonTextUpdate={`Editar ${component}`}
          >
            <FormEstablishment
              onSuccess={handleSuccess}
              onClose={handleClose}
            />
          </DialogCrudEntity>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow space-y-2">
        <EstablishmentsList
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
