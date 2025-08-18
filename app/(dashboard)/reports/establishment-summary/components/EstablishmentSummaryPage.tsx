"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartNoAxesCombined } from "lucide-react";
import { StandaloneCombobox } from "@/app/(dashboard)/components/FormsCreate";
import axiosInstance from "@/utils/axios";
import { EstablishmentVoteSummary } from "./types/EstablishmentVoteSummary";

import { EstablishmentAccordionList } from "./EstablishmentAccordionList";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { CommonLoader } from "@/app/(dashboard)/components/common/CommonLoader";

export default function EstablishmentSummaryPage() {
  const [data, setData] = useState<EstablishmentVoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscuela, setSelectedEscuela] = useState("__all__");
  const [stacked, setStacked] = useState(true);
  const canView = useHasPermission("ver_reportes");

  useEffect(() => {
    axiosInstance
      .get("/api/reports/establishment-vote-summary")
      .then((res) => res.data)
      .then((data) => {
        console.log("📦 Data cruda del backend establishment-vote-summary:", data);
        setData(data)
      })
      .finally(() => setLoading(false));
  }, []);

  const escuelas = [
    { id: "__all__", nombre: "Todos" },
    ...Array.from(
      new Map(
        data
          .filter((m) => m.establecimientoId && m.establecimiento)
          .map((m) => [
            m.establecimientoId,
            { id: m.establecimientoId, nombre: m.establecimiento },
          ])
      ).values()
    ),
  ];

  const filtradas = (
    selectedEscuela !== "__all__"
      ? data.filter((e) => e.establecimientoId.toString() === selectedEscuela)
      : data
  ).sort((a, b) => a.establecimiento.localeCompare(b.establecimiento));

  if (!canView) return <AccessDeniedPage subtitle="Informe por Establecimiento." />;
  if (loading) return <CommonLoader logo="/logo.png"
    alternativeLogo="/logo-white.png"
    alternativeText="Más San Miguel"
    title="Votaciones 2025"
    subTitle="San Miguel"
    loaderText="Cargando Reportes por establecimiento..." />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <ChartNoAxesCombined className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">
              Informe por establecimiento escrutado.
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-semibold text-muted-foreground ml-1">
              Filtrar por Establecimiento
            </span>
            <StandaloneCombobox
              label="Establecimiento"
              value={selectedEscuela}
              onChange={setSelectedEscuela}
              options={escuelas}
              getOptionLabel={(e) => e.nombre}
              getOptionValue={(e) => e.id.toString()}
              withLabel={false}
            />
          </div>

          <EstablishmentAccordionList
            establishments={filtradas}
            stacked={stacked}
            onToggleStacked={() => setStacked((prev) => !prev)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
