"use client";

import { useState } from "react";
import { UserPlus2 } from 'lucide-react';
import { DialogCrudEntity } from "../components/DialogCreateEntity";
import { FormUser } from "./components/FormCreateOrUpdate";
import { UserList } from "./components/List";

export default function UserPage() {
  const [refresh, setRefresh] = useState(false);
  const [search, setSearch] = useState("");
  
  const [open, setOpen] = useState(false);

  const handleRefresh = () => setRefresh((prev) => !prev);
  const handleSuccess = () => {
    handleRefresh();
    setOpen(false);
  };
  const handleClose = () => setOpen(false);

  const component = "Usuario";

  return (
    <div className="space-y-4">
      {/* Título y botón */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">{`Listado de ${component}`}</h2>
        <DialogCrudEntity
          open={open}
          setOpen={setOpen}
          iconButton={<UserPlus2 className="w-5 h-5 text-white" />}
          iconModal={<UserPlus2 className="w-5 h-5 text-muted-foreground" />}
          titleCreate={`Crear ${component}`}
          titleUpdate={`Editar ${component}`}
          description={`Crear y configurar un nuevo ${component}`}
          mode="create"
          buttonTextCreate={`Nuevo ${component}`}
          buttonTextUpdate={`Editar ${component}`}
        >
          <FormUser
            onSuccess={handleSuccess}
            onClose={handleClose}
          />
        </DialogCrudEntity>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow space-y-2">        
        <UserList
          key={String(refresh) + search}
          search={search}
          onDeleted={handleRefresh}
          refresh={refresh}
        />
      </div>
    </div>
  );
}
