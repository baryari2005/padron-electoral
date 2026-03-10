"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartNoAxesCombined } from "lucide-react";
import { StandaloneCombobox } from "@/app/(dashboard)/components/FormsCreate";
import axiosInstance from "@/utils/axios";
import { CircuiteVoteSummary } from "./types/CircuiteVoteSummary";

import { CircuiteAccordionList } from "./CircuiteAccordionList";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";
import { CommonLoader } from "@/app/(dashboard)/components/common/CommonLoader";

export default function CircuiteSummaryPage() {
  const [data, setData] = useState<CircuiteVoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircuite, setSelectedCircuite] = useState("__all__");
  const [stacked, setStacked] = useState(true);
  const canView = useHasPermission("ver_reportes");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    axiosInstance
      .get("/api/reports/circuite-vote-summary")
      .then((res) => res.data)
      .then((data) => {
        console.log("📦 Data cruda del backend circuite-vote-summary:", data);
        setData(data)
      })
      .finally(() => setLoading(false));
  }, []);

  const circuites = [
    { id: "__all__", nombre: "Todos" },
    ...Array.from(
      new Map(
        data
          .filter((m) => m.circuitoId && m.circuito)
          .map((m) => [
            m.circuitoId,
            { id: m.circuitoId, nombre: m.circuito },
          ])
      ).values()
    ),
  ];

  const filtradas = (
    selectedCircuite !== "__all__"
      ? data.filter((c) => c.circuitoId.toString() === selectedCircuite)
      : data
  ).sort((a, b) => a.circuito.localeCompare(b.circuito));

  if (!canView) return <AccessDeniedPage subtitle="Informe por Circuito."/>;
  if (loading) return <CommonLoader
    logo="/logo.png"
    alternativeLogo="/logo-white.png"
    alternativeText={`Más San Miguel ${currentYear}`}
    title="Elecciones Generales"
    subTitle={`San Miguel ${currentYear}`}
    loaderText="Cargando Reportes por circuito..." />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <ChartNoAxesCombined className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">
              Informe por circuito escrutado.
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-semibold text-muted-foreground ml-1">
              Filtrar por Circuito
            </span>
            <StandaloneCombobox
              label="Circuito"
              value={selectedCircuite}
              onChange={setSelectedCircuite}
              options={circuites}
              getOptionLabel={(c) => c.nombre}
              getOptionValue={(c) => c.id.toString()}
              withLabel={false}
            />
          </div>

          <CircuiteAccordionList
            circuites={filtradas}
            stacked={stacked}
            onToggleStacked={() => setStacked((prev) => !prev)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
