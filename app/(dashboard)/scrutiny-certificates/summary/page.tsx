"use client"

import { useHasPermission } from "@/lib/permissions/useHasPermission";
import CertificadosResumenPage from "../components/CertificadosResumenPage";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";

export default function ScrutinyCertificatePage() {
  const canView = useHasPermission("ver_certificado");

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
