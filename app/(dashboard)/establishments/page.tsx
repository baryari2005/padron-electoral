"use client";

import { useState } from "react";
import { DialogCrudEntity } from "../components/DialogCreateEntity";
import { Landmark } from "lucide-react";
import { FormEstablishment } from "./components/FormCreateOrUpdate";
import { EstablishmentsList } from "./components/List";

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
  const component = "Establecimiento";

  return (
    <div className="space-y-4">
      {/* Título y botón */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Listado de {component}s</h2>
        <DialogCrudEntity
          open={open}
          setOpen={setOpen}
          iconButton={<Landmark className="w-5 h-5 text-white" />}
          iconModal={<Landmark className="w-5 h-5 text-muted-foreground" />}
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
      </div>

      <div className="rounded-xl border bg-card p-6 shadow space-y-2">        
        <EstablishmentsList
          key={String(refresh) + search}
          search={search}
          onDeleted={handleRefresh}
          refresh={refresh}
        />
      </div>
    </div>
  );
}
