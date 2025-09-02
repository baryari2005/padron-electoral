
"use client";

import { Separator } from "@/components/ui/separator";
import BulkAuthoritiesForm from "./BulkAuthoritiesForm";

export default function Page() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl">Generar usuarios autoridades de mesa</h2>
        <p className="text-sm text-muted-foreground">
          Recorre las escuelas y crea un usuario por cada una. Podés simular (dry-run), filtrar por circuito o por IDs,
          y exportar las credenciales.
        </p>
      </div>
      <BulkAuthoritiesForm />
    </div>    
  );
}
