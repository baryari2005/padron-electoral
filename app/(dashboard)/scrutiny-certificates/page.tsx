"use client";

import { Separator } from "@/components/ui/separator";
import CertificadoForm from "./components/CertificadoForm";
import CertificadoHeader from "./components/CertificadoHeader";
import { useEffect, useState } from "react";
import { EstablecimientoConCircuito } from "./components/types";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";
import { useAuthStore } from "@/auth";

type UsuarioEstablecimientoLite = {
  principal?: boolean;
  establecimiento?: EstablecimientoConCircuito;   
  establecimientoId?: number;                     
};

function getDefaultEscuelaFromUser(
  user: unknown
): EstablecimientoConCircuito | null {
  if (
    user &&
    typeof user === "object" &&
    "escuelas" in (user as any) &&
    Array.isArray((user as any).escuelas)
  ) {
    const escuelas = (user as any).escuelas as UsuarioEstablecimientoLite[];
    const conPrioridad = escuelas.find((e) => e?.principal) ?? escuelas[0];    
    if (conPrioridad?.establecimiento) return conPrioridad.establecimiento as EstablecimientoConCircuito;
  }
  return null;
}

export default function ScrutinyCertificatePage() {
  const [mesa, setMesa] = useState("0");
  const [escuela, setEscuela] = useState<EstablecimientoConCircuito | null>(null);
  const canCreate = useHasPermission("crear_certificados");

  const user = useAuthStore((s) => s.user);

  // Intentamos resolver la escuela por defecto directamente del user
  const defaultEscuela = getDefaultEscuelaFromUser(user);

  useEffect(() => {
    if (defaultEscuela) {
      setEscuela(defaultEscuela);
      return;
    }
  }, [defaultEscuela]);

  if (!canCreate) {
    return <AccessDeniedPage subtitle="Alta Certificado Escrutinio." />;
  }

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 font-sans">
      <h1 className="text-2xl font-bold mb-6">Carga de Certificado de Escrutinio</h1>

      <CertificadoHeader
        modo="crear"
        seccion="53 - SAN MIGUEL"
        circuito={
          escuela
            ? `${escuela?.circuito?.nombre ?? ""} (${escuela?.circuito?.codigo ?? ""})`
            : "-"
        }
        mesa={mesa !== "0" ? mesa : "-"}
      />
      <Separator className="mb-8" />

      {/* Pasamos la escuela fija al form (ver nota abajo) */}
      <CertificadoForm
        modo="crear"
        onMesaChange={setMesa}
        onEscuelaSeleccionada={setEscuela}
        escuelaFija={escuela}
      />
    </div>
  );
}
