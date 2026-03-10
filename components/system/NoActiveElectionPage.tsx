"use client";

import { SystemStatusPage } from "./SystemStatusPage";

export function NoActiveElectionPage() {
  return (
    <SystemStatusPage
      code={409}
      title="No existe una elección activa"
      description="Para realizar esta operación debes activar una elección."
      buttonText="Ir a Elecciones"
      href="/elections"
    />
  );
}