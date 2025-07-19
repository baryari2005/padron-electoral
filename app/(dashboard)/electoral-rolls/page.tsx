"use client";

import { useState } from "react";
import { ElectoralRollHeader } from "./components/Header";
import { ElectoralRollList } from "./components/List";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormCreateOrUpdateElectoralRoll } from "./components/FormCreateOrUpdate";
import { Separator } from "@/components/ui/separator";

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

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Elector
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <DialogTitle>Crear Elector</DialogTitle>
              </div>
              <DialogDescription>
                Crear y configurar un nuevo elector
              </DialogDescription>
              <Separator />
            </DialogHeader>
            <div className="mt-4">
              <FormCreateOrUpdateElectoralRoll
                onSuccess={handleSuccess}
                onClose={handleClose}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contenedor con filtros, búsqueda y tabla */}
      <div className="rounded-xl border bg-card p-6 shadow space-y-2">
        {/* Filtros en 3 columnas */}
        <ElectoralRollHeader
          onElectoralRollCreated={handleRefresh}
          onSearchChange={handleSearchChange}
          onFiltersChange={handleFiltersChange}
        />

        {/* Tabla con buscador interno */}
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
