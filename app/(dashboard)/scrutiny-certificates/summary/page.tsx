"use client"

import { useHasPermission } from "@/lib/permissions/useHasPermission";
import CertificadosResumenPage from "../components/CertificadosResumenPage";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";
import { useEffect } from "react";
import { useActiveElection } from "@/hooks/useActiveElection";
import { StatusPage } from "@/components/status/StatusPage";

export default function ScrutinyCertificatePage() {
  const canView = useHasPermission("ver_certificados");
  const { loading, hasActive } = useActiveElection();

  useEffect(() => {
    console.log("Permiso ver_certificados =", canView);
  }, [canView]);

  if (!canView) {
    return <AccessDeniedPage subtitle="Listado Certificado Escrutinio." />;
  }

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
  return (
    <div className="max-w-full "> {/* font-sans opcional */}
      <h2 className="text-2xl mb-6">Listado de Certificado de Escrutinio Cargados</h2>

      <CertificadosResumenPage />
    </div>
  );
}
