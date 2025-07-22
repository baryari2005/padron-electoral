"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import { DialogCrudEntity } from "../components/DialogCreateEntity";
import { FormPoliticalGroup, PoliticalGroupList } from "./components";


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

  return (
    <div className="space-y-4">
      {/* Título y botón */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Listado de Agrupaciones Políticas</h2>
        <DialogCrudEntity
          open={open}
          setOpen={setOpen}
          iconButton={<Compass className="w-5 h-5 text-white" />}
          iconModal={<Compass className="w-5 h-5 text-muted-foreground" />}
          titleCreate="Crear Agrupación Política"
          titleUpdate="Editar Agrupación Política"
          description="Crear y configurar una nueva Agrupación Política"
          mode="create"
          buttonTextCreate="Nueva Agrupación Política"
          buttonTextUpdate="Editar Agrupación Política"
        >
          <FormPoliticalGroup
            onSuccess={handleSuccess}
            onClose={handleClose}
          />
        </DialogCrudEntity>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow space-y-2">        
        <PoliticalGroupList
          key={String(refresh) + search}
          search={search}
          onDeleted={handleRefresh}
          refresh={refresh}
        />
      </div>
    </div>
  );
}
