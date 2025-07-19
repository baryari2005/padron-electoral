"use client"

import { Separator } from "@/components/ui/separator";
import CertificadoForm from "./components/CertificadoForm";
import CertificadoHeader from "./components/CertificadoHeader";
import { useState } from "react";

export default function ScrutinyCertificatePage() {
  const [mesa, setMesa] = useState("0");
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 font-sans"> {/* font-sans opcional */}
      <h1 className="text-2xl font-bold mb-6">Carga de Certificado de Escrutinio</h1>

      <CertificadoHeader
        seccion="53 - SAN MIGUEL"
        circuito="0"
        mesa={mesa}
      />
      <Separator className="mb-8"/>

      <CertificadoForm onMesaChange={setMesa}/>
    </div>
  );
}
