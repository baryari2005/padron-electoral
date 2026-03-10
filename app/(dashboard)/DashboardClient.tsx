"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardCategoryPies from "./components/Dashboard/DashboardCategoryPie";
import PercentPill from "@/components/ui/percent-pill";
import axiosInstance from "@/utils/axios";
import AutoRefresh from "./components/Dashboard/AutoRefresh";
import { SummaryResponse } from "./components/Dashboard/types/types";
import { KPIStat } from "./components/Dashboard/KPIStat";
import { fmtAR, fmtPct } from "./lib/format";
import { MapPinned, School, Table, Users } from "lucide-react";
import { ProgressList } from "./components/Dashboard/lists/ProgressList";
import { ParticipationList } from "./components/Dashboard/lists/ParticipationList";
import { LeadersGrid } from "./components/Dashboard/LeadersGrid";
import { DashboardRefreshBridge } from "./components/Dashboard/DashboardRefreshBridge";
import { GradientProgress } from "@/components/ui/GradientProgress";

interface DashboardProps {
    data: SummaryResponse;
    election: any;
}

export default function DashboardClient({
    data: initial,
    election,
}: DashboardProps) {
    const [data, setData] = useState(initial);

    const isInternal =
        String(election?.tipo ?? "").toUpperCase() === "INTERNA";

    useEffect(() => {
        const refetch = async () => {
            const res = await axiosInstance.get("/api/dashboard/summary", {
                params: { ts: Date.now() },
                headers: { "Cache-Control": "no-cache" },
            });
            setData(res.data);
        };

        const h = () => void refetch();
        window.addEventListener("dashboard:refresh", h);
        return () => window.removeEventListener("dashboard:refresh", h);
    }, []);

    const { municipio, top, progreso, participacion, especiales, lideresPorCategoria } = data;
    const faltanMesas = Math.max(
        (municipio?.mesasTotales ?? 0) - (municipio?.mesasEscrutadas ?? 0),
        0
    );

    const specialsData = useMemo(
        () => [
            { name: "Nulos", value: especiales.nulos },
            { name: "En blanco", value: especiales.blancos },
            { name: "Recurridos", value: especiales.recurridos },
            { name: "Impugnados", value: especiales.impugnados },
        ],
        [especiales]
    );

    const refreshDashboard = async () => {
        const res = await axiosInstance.get("/api/dashboard/summary", {
            params: { ts: Date.now() },
            headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        });
        setData(res.data);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-base font-semibold"></h1>
                <AutoRefresh intervalSec={60} onRefresh={refreshDashboard} />
            </div>

            <DashboardRefreshBridge />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <KPIStat
                    title="Mesas escrutadas de Total de mesas."
                    value={`${municipio.mesasEscrutadas} / ${municipio.mesasTotales}`}
                    sub={`${fmtPct(municipio.porcentajeEscrutado)} escrutado`}
                    icono={Table}
                >
                    <div className="mt-2 flex items-center gap-2">
                        <div className="min-w-[120px]">
                            <GradientProgress
                                value={municipio.porcentajeEscrutado}
                                height={18}
                                durationMs={600}
                            />
                        </div>
                        <PercentPill
                            value={municipio.porcentajeEscrutado}
                            tiers
                            thresholds={{ low: 5, mid: 60 }}
                        />
                    </div>
                </KPIStat>

                <KPIStat
                    title="Votantes registrados de Cantidad de electores."
                    value={`${fmtAR.format(municipio.votantesRegistrados)} / ${fmtAR.format(
                        municipio.padronTotal
                    )}`}
                    sub={`${fmtPct(municipio.participacionMunicipal)} del padrón`}
                    icono={Users}
                />

                <KPIStat
                    title="Participación municipal"
                    value={fmtPct(municipio.participacionMunicipal)}
                    icono={MapPinned}
                >
                    <div className="mt-2 flex items-center gap-2">
                        <PercentPill
                            value={municipio.participacionMunicipal}
                            tiers
                            thresholds={{ low: 5, mid: 60 }}
                        />
                    </div>
                </KPIStat>
            </div>

            <LeadersGrid items={lideresPorCategoria} />

            <div className={`grid grid-cols-1 gap-4 ${isInternal ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                <ProgressList
                    title="Progreso por establecimiento (mesas escrutadas)"
                    items={progreso.porEscuela}
                    labelKey="establecimiento"
                    limit={10}
                    autoCarousel
                    intervalMs={4000}
                    pauseOnHover
                    loop
                    showControls
                    icono={School}
                />

                <ProgressList
                    title="Progreso por circuito (mesas escrutadas)"
                    items={progreso.porCircuito}
                    labelKey="circuito"
                    icono={MapPinned}
                />

                {isInternal ? (
                    <ProgressList
                        title="Progreso por referente"
                        items={progreso.porReferente ?? []}
                        labelKey="referente"
                        limit={10}
                        autoCarousel
                        intervalMs={4000}
                        pauseOnHover
                        loop
                        showControls
                        icono={Users}
                    />
                ) : ""}

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ParticipationList
                    title="Top 10 - participación de votantes por escuela"
                    items={participacion.porEscuela}
                    labelKey="establecimiento"
                    icono={School}
                />
                <ParticipationList
                    title="Top 10 - participación de votantes por circuito"
                    items={participacion.porCircuito}
                    labelKey="circuito"
                    icono={MapPinned}
                />
            </div>

            <DashboardCategoryPies
                resultados={data.resultadosCategoriaAgrupacion}
                categoryOrder={["CONCEJALES", "SENADORES PROVINCIALES"]}
                defaultVariant="donut"
                showControls
            />
        </div>
    );
}