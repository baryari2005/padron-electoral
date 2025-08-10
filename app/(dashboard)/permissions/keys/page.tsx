"use client";

import { useState } from "react";

import { MapPinned, Shield, ShieldPlus } from "lucide-react";
import { PermissionsKeyForm } from "./components/PermissionsKeyForm";
import { PermissionsKeyList } from "./components/PermissionsKeyList";
import { DialogCrudEntity } from "../../components";

export default function PermissionsKeyPage() {
  const [refresh, setRefresh] = useState(false);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const handleRefresh = () => setRefresh((prev) => !prev);
  const handleSuccess = () => {
    handleRefresh();
    setOpen(false);
  };
  const handleClose = () => setOpen(false);

  const components = "Permisos";
  const component = "Permiso";

  
  return (
    <div className="space-y-4">
      {/* Título y botón */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Listado de {component}s</h2>
          <DialogCrudEntity
            open={open}
            setOpen={setOpen}
            iconButton={<ShieldPlus className="w-5 h-5 text-white" />}
            iconModal={<ShieldPlus className="w-5 h-5 text-muted-foreground" />}
            titleCreate={`Crear ${component}`}
            titleUpdate={`Editar ${component}`}
            description={`Crear y configurar una nuevo ${component}`}
            mode="create"
            buttonTextCreate={`Nuevo ${component}`}
            buttonTextUpdate={`Editar ${component}`}
          >
            <PermissionsKeyForm
              onSuccess={handleSuccess}
              onClose={handleClose}
            />
          </DialogCrudEntity>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow space-y-2">
        <PermissionsKeyList
          key={String(refresh) + search}
          search={search}
          onDeleted={handleRefresh}
          refresh={refresh}
        />
      </div>
    </div>
  );
}
