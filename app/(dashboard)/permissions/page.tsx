"use client";

import { PermisosPorRolGridForm } from "./components/PermisosPorRolGridForm";

export default function PermissionsPage() {
  return (
    <div className="mt-1 space-y-6">
      {/* Título y botón */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Listado de Permisos por Rol</h2>        
      </div>

      <div className="rounded-xl border bg-card p-6 shadow space-y-2">      
        <PermisosPorRolGridForm />
      </div>
    </div>
  );
}
