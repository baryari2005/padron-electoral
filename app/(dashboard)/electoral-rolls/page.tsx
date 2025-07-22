"use client";

import { useState } from "react";
import { ElectoralRollHeader, } from "./components/Header";
import { ElectoralRollList } from "./components/List";
import { UserPlus } from "lucide-react";
import { FormCreateOrUpdateElectoralRoll } from "./components/FormCreateOrUpdate";
import { DialogCrudEntity } from "../components/DialogCreateEntity";


export default function ElectoralRollPage() {
  const [refresh, setRefresh] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{
    localidad?: string;
    circuitoId?: number;
    establecimientoId?: number;
  }>({});

  const [open, setOpen] = useState(false);

  const handleRefresh = () => setRefresh((prev) => !prev);
  const handleSearchChange = (value: string) => setSearch(value);
  const handleFiltersChange = (newFilters: typeof filters) => setFilters(newFilters);
  const handleSuccess = () => {
    handleRefresh();
    setOpen(false);
  };
  const handleClose = () => setOpen(false);

  return (
    <div className="space-y-4">
      {/* Título y botón */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Listado de Electores</h2>
        <DialogCrudEntity
          open={open}
          setOpen={setOpen}
          iconButton={<UserPlus className="w-5 h-5 text-white" />}
          iconModal={<UserPlus className="w-5 h-5 text-muted-foreground" />}
          titleCreate="Crear Elector"
          titleUpdate="Editar Elector"
          description="Crear y configurar un nuevo elector"
          mode="create"
          buttonTextCreate="Nuevo Elector"
          buttonTextUpdate="Editar Elector"
        >
          <FormCreateOrUpdateElectoralRoll
            onSuccess={handleSuccess}
            onClose={handleClose}
          />
        </DialogCrudEntity>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow space-y-2">
        <ElectoralRollHeader                    
          onFiltersChange={handleFiltersChange}
        />
        <ElectoralRollList
          key={String(refresh) + search + JSON.stringify(filters)}
          search={search}
          filters={filters}
          onDeleted={handleRefresh}
          refresh={refresh}
        />
      </div>
    </div>
  );
}
