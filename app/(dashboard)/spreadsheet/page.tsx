"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogCrudEntity } from "../components/DialogCreateEntity";
import { FormSpreadsheet } from "./components/spreadsheetForm";
import { SpreadsheetList } from "./components/spreadsheetList";
import { FileSpreadsheet, Search } from "lucide-react";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";

import { StatusPage } from "@/components/status/StatusPage";
import { useActiveElection } from "@/hooks/useActiveElection";

export default function SpreadsheetPage() {
  const [refresh, setRefresh] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const handleRefresh = () => setRefresh((prev) => !prev);

  const handleSuccess = () => {
    handleRefresh();
    setOpen(false);
  };

  const handleClose = () => setOpen(false);

  const component = "Planilla";

  const { loading, hasActive } = useActiveElection();

  const canView = useHasPermission("ver_planillas");
  const canCreate = useHasPermission("crear_planillas");
  const canEdit = useHasPermission("editar_planillas");
  const canDelete = useHasPermission("eliminar_planillas");

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
    return <AccessDeniedPage subtitle="Ver Planillas." />;
  }

  // return (
  //   <div className="space-y-4">

  //     {/* Header */}
  //     <div className="flex items-center justify-between gap-3">
  //       <h2 className="text-2xl">Listado de {component}s</h2>

  //       <div className="flex items-center gap-2">

  //         {/* 🔎 Buscador */}
  //         <div className="relative w-[320px]">
  //           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  //           <Input
  //             value={search}
  //             onChange={(e) => setSearch(e.target.value)}
  //             placeholder="Buscar por número o nombre..."
  //             className="pl-9"
  //           />
  //         </div>

  //         {/* Limpiar búsqueda */}
  //         {search && (
  //           <Button variant="secondary" onClick={() => setSearch("")}>
  //             Limpiar
  //           </Button>
  //         )}

  //         {/* Crear Planilla */}
  //         {canCreate && (
  //           <DialogCrudEntity
  //             open={open}
  //             setOpen={setOpen}
  //             iconButton={<FileSpreadsheet className="w-5 h-5 text-white" />}
  //             iconModal={<FileSpreadsheet className="w-5 h-5 text-muted-foreground" />}
  //             titleCreate={`Crear ${component}`}
  //             titleUpdate={`Editar ${component}`}
  //             description={`Crear y configurar una nueva ${component}`}
  //             mode="create"
  //             buttonTextCreate={`Nueva ${component}`}
  //             buttonTextUpdate={`Editar ${component}`}
  //           >
  //             <FormSpreadsheet
  //               onSuccess={handleSuccess}
  //               onClose={handleClose}
  //             />
  //           </DialogCrudEntity>
  //         )}

  //       </div>
  //     </div>

  //     {/* Tabla */}
  //     <div className="rounded-xl border bg-card p-6 shadow space-y-2">
  //       <SpreadsheetList
  //         key={String(refresh) + search}
  //         search={search}
  //         onDeleted={handleRefresh}
  //         refresh={refresh}
  //         canEdit={canEdit}
  //         canDelete={canDelete}
  //       />
  //     </div>

  //   </div>
  // );

  return (
    <div className="space-y-4">
      {/* Título y botón */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Listado de {component}s</h2>
        {canCreate && (
          <DialogCrudEntity
            open={open}
            setOpen={setOpen}
            iconButton={<FileSpreadsheet className="w-5 h-5 text-white" />}
            iconModal={<FileSpreadsheet className="w-5 h-5 text-muted-foreground" />}
            titleCreate={`Crear ${component}`}
            titleUpdate={`Editar ${component}`}
            description={`Crear y configurar una nuevo ${component}`}
            mode="create"
            buttonTextCreate={`Nuevo ${component}`}
            buttonTextUpdate={`Editar ${component}`}
          >
            <FormSpreadsheet
              onSuccess={handleSuccess}
              onClose={handleClose}
            />
          </DialogCrudEntity>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow space-y-2">
        <SpreadsheetList
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