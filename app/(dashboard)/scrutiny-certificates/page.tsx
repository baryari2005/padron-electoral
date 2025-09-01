"use client"

import { Separator } from "@/components/ui/separator";
import CertificadoForm from "./components/CertificadoForm";
import CertificadoHeader from "./components/CertificadoHeader";
import { useState } from "react";
import { EstablecimientoConCircuito } from "./components/types";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";

export default function ScrutinyCertificatePage() {
  const [mesa, setMesa] = useState("0");
  const [escuela, setEscuela] = useState<EstablecimientoConCircuito | null>(null);
  const canCreate = useHasPermission("crear_certificado");

  if (!canCreate) {
    return <AccessDeniedPage subtitle="Alta Certificado Escrutinio." />;
  }

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 font-sans"> {/* font-sans opcional */}
      <h1 className="text-2xl font-bold mb-6">Carga de Certificado de Escrutinio</h1>

      <CertificadoHeader
        modo="crear"
        seccion="53 - SAN MIGUEL"
        circuito={escuela ? `${escuela?.circuito.nombre ?? ""} (${escuela?.circuito.codigo ?? ""})` : "-"}
        mesa={mesa !== "0" ? mesa : "-"}
      />
      <Separator className="mb-8" />

      <CertificadoForm modo="crear" onMesaChange={setMesa} onEscuelaSeleccionada={setEscuela} />
    </div>
  );
}
