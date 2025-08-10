"use client";

import { useState } from "react";
import { DialogCrudEntity } from "../components/DialogCreateEntity";
import { CategoryList, FormCategory } from "./components";
import { BookUser } from "lucide-react";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";



export default function CategoriesPage() {
  const [refresh, setRefresh] = useState(false);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const handleRefresh = () => setRefresh((prev) => !prev);
  const handleSuccess = () => {
    handleRefresh();
    setOpen(false);
  };
  const handleClose = () => setOpen(false);
  const components = "Cargos Políticos";
  const component = "Cargo Político";

  const canView = useHasPermission("ver_categorias");
  const canCreate = useHasPermission("crear_categorias");
  const canEdit = useHasPermission("editar_categorias");
  const canDelete = useHasPermission("eliminar_categorias");

  if (!canView) {
    return <AccessDeniedPage/>
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
            iconButton={<BookUser className="w-5 h-5 text-white" />}
            iconModal={<BookUser className="w-5 h-5 text-muted-foreground" />}
            titleCreate={`Crear ${component}`}
            titleUpdate={`Editar ${component}`}
            description={`Crear y configurar un nuevo ${component}`}
            mode="create"
            buttonTextCreate={`Nuevo ${component}`}
            buttonTextUpdate={`Editar ${component}`}
          >
            <FormCategory
              onSuccess={handleSuccess}
              onClose={handleClose}
            />
          </DialogCrudEntity>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow space-y-2">
        <CategoryList
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
