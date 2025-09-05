"use client"

import { useHasPermission } from "@/lib/permissions/useHasPermission";
import CertificadosResumenPage from "../components/CertificadosResumenPage";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";
import { useEffect } from "react";

export default function ScrutinyCertificatePage() {
  const canView = useHasPermission("ver_certificados");
  useEffect(() => {
    console.log("Permiso ver_certificados =", canView);
  }, [canView]);

  if (!canView) {
    return <AccessDeniedPage subtitle="Listado Certificado Escrutinio." />;
  }
  return (
    <div className="max-w-full "> {/* font-sans opcional */}
      <h2 className="text-2xl mb-6">Listado de Certificado de Escrutinio Cargados</h2>

      <CertificadosResumenPage />
    </div>
  );
}
