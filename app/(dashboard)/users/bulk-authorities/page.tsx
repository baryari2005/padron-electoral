
"use client";

import { Separator } from "@/components/ui/separator";
import BulkAuthoritiesForm from "./BulkAuthoritiesForm";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";




export default function Page() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Generar usuarios autoridades de mesa
        </h1>
        <p className="text-sm text-muted-foreground">
          Recorre las escuelas y crea un usuario por cada una. Podés simular (dry-run), filtrar por circuito o por IDs,
          y exportar las credenciales.
        </p>
      </header>

      <Separator />

      <BulkAuthoritiesForm />
    </div>
  );
}
