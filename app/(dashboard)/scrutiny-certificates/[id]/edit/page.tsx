"use client";

import { useRouter, useParams } from "next/navigation";

import CertificadoForm from "../../components/CertificadoForm";
import CertificadoHeader from "../../components/CertificadoHeader";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";


export default function EditCertificadoPage() {
  const [metadata, setMetadata] = useState({ seccion: "", circuito: "", mesa: "" });
  const router = useRouter();
  const params = useParams();
  const mesaId = Number(params.id);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 font-sans"> {/* font-sans opcional */}
      
      <div className="mb-6">
        <Link
          href="/scrutiny-certificates/summary"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowBigLeft className="w-5 h-5 mr-1" />
          Volver 
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Editar Certificado de Escrutinio</h1>
      <CertificadoHeader
        modo="editar"
        seccion={metadata.seccion}
        circuito={metadata.circuito}
        mesa={metadata.mesa}
      />
      <Separator className="mb-8" />

      <CertificadoForm
        modo="editar"
        mesaId={mesaId}
        onSuccess={() => {
          router.push("/scrutiny-certificates/summary");
        }}
        onMetadataLoaded={setMetadata}
      />
    </div>
  );
}
