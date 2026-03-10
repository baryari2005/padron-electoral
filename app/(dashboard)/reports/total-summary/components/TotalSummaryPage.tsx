"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartNoAxesCombined } from "lucide-react";
import axiosInstance from "@/utils/axios";
import { TotalVoteSummary } from "./types/TotalVoteSummary";

import { TotalAccordionList } from "./TotalAccordionList";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";
import { CommonLoader } from "@/app/(dashboard)/components/common/CommonLoader";

export default function TotalSummaryPage() {
  const [data, setData] = useState<TotalVoteSummary>();
  const [loading, setLoading] = useState(true);
  const [stacked, setStacked] = useState(true);
  const currentYear = new Date().getFullYear();

  const canView = useHasPermission("ver_reportes");

  useEffect(() => {
    axiosInstance
      .get("/api/reports/total-vote-summary")
      .then((res) => res.data)
      .then((data) => {
        console.log("📦 Data cruda del backend total-vote-summary:", data);
        setData(data)
      })
      .finally(() => setLoading(false));
  }, []);

  if (!canView) return <AccessDeniedPage subtitle="Informe Votos Totales." />;
  if (loading) return <CommonLoader logo="/logo.png"
    alternativeLogo="/logo-white.png"
    alternativeText={`Más San Miguel ${currentYear}`}
    title="Elecciones Generales"
    subTitle={`San Miguel ${currentYear}`}
    loaderText="Cargando Reportes ..." />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <ChartNoAxesCombined className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">
              Informe votos escrutado.
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {data &&
            <TotalAccordionList
              total={data}
              stacked={stacked}
              onToggleStacked={() => setStacked((prev) => !prev)}
            />
          }
        </CardContent>
      </Card>
    </div>
  );
}
