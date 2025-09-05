"use client";

import { useEffect, useState } from "react";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";

import { StandaloneCombobox } from "@/app/(dashboard)/components/FormsCreate";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartNoAxesCombined } from "lucide-react";
import axiosInstance from "@/utils/axios";


import { MesaAccordionList } from "./MesaAccordionList";
import { CommonLoader } from "@/app/(dashboard)/components/common/CommonLoader";
import { MesaVoteSummary } from "./types/MesaVoteSummary";


export default function MesaSummaryPage() {
    const [data, setData] = useState<MesaVoteSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEscuela, setSelectedEscuela] = useState<string>("__all__");
    const [stacked, setStacked] = useState(true);

    const canView = useHasPermission("ver_reportes");

    useEffect(() => {
        axiosInstance
            .get("/api/reports/mesa-vote-summary")
            .then((res) => res.data)
            .then((data) => {
                console.log("📦 Data cruda del backend mesa-vote-summary:", data);
                setData(data)
            })
            .finally(() => setLoading(false));
    }, []);

    if (!canView) return <AccessDeniedPage subtitle="Informe de Votos por Mesa." />;

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

    const mesasFiltradas = (selectedEscuela !== "__all__"
        ? data.filter((m) => m.establecimientoId.toString() === selectedEscuela)
        : data
    ).sort((a, b) => {
        const estA = a.establecimiento.toLowerCase();
        const estB = b.establecimiento.toLowerCase();
        if (estA < estB) return -1;
        if (estA > estB) return 1;
        return a.numero - b.numero;
    });

    if (loading) return <CommonLoader logo="/logo.png"
        alternativeLogo="/logo-white.png"
        alternativeText="Más San Miguel 2025"
        title="Elecciones Provinciales"
        subTitle="San Miguel 2025"
        loaderText="Cargando Reportes por mesa..." />;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-2">
                        <ChartNoAxesCombined className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg font-semibold">
                            Informe por mesas escrutadas.
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

                    <MesaAccordionList
                        mesas={mesasFiltradas}
                        stacked={stacked}
                        onToggleStacked={() => setStacked((prev) => !prev)}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
