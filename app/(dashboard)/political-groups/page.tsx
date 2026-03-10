"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import { DialogCrudEntity } from "../components/DialogCreateEntity";
import { FormPoliticalGroup, PoliticalGroupList } from "./components";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";
import { useActiveElection } from "@/hooks/useActiveElection";
import { StatusPage } from "@/components/status/StatusPage";

function returnString(inPlural: boolean, electionType?: string) {
  if (inPlural)
    return electionType !== "INTERNA"
      ? "Agrupaciones Políticas"
      : "Listas Políticas";

  return electionType !== "INTERNA"
    ? "Agrupación Política"
    : "Lista Política";
}

export default function PoliticalGroupPage() {
  const [refresh, setRefresh] = useState(false);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const handleRefresh = () => setRefresh((prev) => !prev);
  const handleSuccess = () => {
    handleRefresh();
    setOpen(false);
  };
  const handleClose = () => setOpen(false);
  
  const { electionType, loading, hasActive } = useActiveElection();

  const components = returnString(true, electionType);
  const component = returnString(false, electionType);

  const canView = useHasPermission("ver_agrupaciones");
  const canCreate = useHasPermission("crear_agrupaciones");
  const canEdit = useHasPermission("editar_agrupaciones");
  const canDelete = useHasPermission("eliminar_agrupaciones");

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

  if (!canView) return (<AccessDeniedPage subtitle={"Ver " + returnString(true)} />);

  return (
    <div className="space-y-4">
      {/* Título y botón */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">{"Listado de " + returnString(true, electionType)}</h2>
        {canCreate && (
          <DialogCrudEntity
            open={open}
            setOpen={setOpen}
            iconButton={<Compass className="w-5 h-5 text-white" />}
            iconModal={<Compass className="w-5 h-5 text-muted-foreground" />}
            titleCreate={"Crear " + returnString(false, electionType)}
            titleUpdate={"Editar " + returnString(false, electionType)}
            description={"Crear y configurar una nueva " + returnString(false, electionType)}
            mode="create"
            buttonTextCreate={"Nueva " + returnString(false, electionType)}
            buttonTextUpdate={"Editar " + returnString(false, electionType)}
          >
            <FormPoliticalGroup
              onSuccess={handleSuccess}
              onClose={handleClose}
            />
          </DialogCrudEntity>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow space-y-2">
        <PoliticalGroupList
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
