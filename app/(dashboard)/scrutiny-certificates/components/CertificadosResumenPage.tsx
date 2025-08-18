// app/(dashboard)/scrutiny-certificates/page.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCertificatesSummary } from "../hooks/useCertificatesSummary";
import { CertificatesFiltersHeader } from "./CertificatesFiltersHeader";
import { CertificatesSummaryList } from "./CertificatesSummaryList";
import { Cargando } from "@/components/ui/upload";
import { ListChecks } from "lucide-react";
import { Separator } from "@/components/ui/separator";


export default function CertificadosResumenPage() {
  const {
    filters, setFilters,
    escuelasFiltradas, totalMesas,
    loading,
  } = useCertificatesSummary(); // ← extraé lógica de fetch + filtrado

  if (loading) return <Cargando label="Cargando Certificados de escrutinios..." />

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-semibold">Resumen de Carga de Certificados</CardTitle>
            </div>

            <div className="text-sm text-muted-foreground">
              {escuelasFiltradas.length} escuelas / {totalMesas} mesas cargadas
            </div>
          </div>
        <div className="flex flex-col pb-2 mt-4 ">
          <CertificatesFiltersHeader onFiltersChange={setFilters} />
        </div>
        <Separator/>
        </CardHeader>
        <CardContent className="mt-4">
          <CertificatesSummaryList escuelas={escuelasFiltradas} />
        </CardContent>
      </Card>
    </div>
  );
}
