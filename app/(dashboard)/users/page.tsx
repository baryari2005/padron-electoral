// app/(dashboard)/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { UserPlus2 } from "lucide-react";
import { DialogCrudEntity } from "../components/DialogCreateEntity";
import { FormUser } from "./components/UserForm";
import { UserList } from "./components/UserList";
import axiosInstance from "@/utils/axios";
import type { Rol } from "@prisma/client";   // 👈 importa el tipo

export default function UserPage() {
  const [refresh, setRefresh] = useState(false);
  const [search, setSearch] = useState("");

  const [roles, setRoles] = useState<Rol[]>([]);     // 👈 ahora es Rol[]
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [open, setOpen] = useState(false);

  const handleRefresh = () => setRefresh((p) => !p);
  const handleSuccess = () => { handleRefresh(); setOpen(false); };
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await axiosInstance.get("/api/roles");
        // Puede venir como {items: Rol[]} o Rol[]
        const items: Rol[] = Array.isArray(data) ? data : (data?.items ?? []);
        setRoles(items);                               // 👈 no remapear
      } catch (err) {
        console.error("Error cargando roles:", err);
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  const component = "Usuario";

  return (
    <div className="space-y-4">
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
          <FormUser onSuccess={handleSuccess} onClose={handleClose} roles={roles} />
        </DialogCrudEntity>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow space-y-2">
        <UserList key={String(refresh) + search} search={search} onDeleted={handleRefresh} refresh={refresh} />
      </div>
    </div>
  );
}
