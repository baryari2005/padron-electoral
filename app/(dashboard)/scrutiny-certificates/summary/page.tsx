"use client"

import CertificadosResumenPage from "../components/CertificadosResumenPage";

export default function ScrutinyCertificatePage() {
  
  return (
    <div className="max-w-full "> {/* font-sans opcional */}
      <h2 className="text-2xl mb-6">Listado de Certificado de Escrutinio Cargados</h2>

      <CertificadosResumenPage/>
    </div>
  );
}
