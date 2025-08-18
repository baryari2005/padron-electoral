"use client";

import { useEffect, useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import DashboardCategoryPies from "./components/Dashboard/DashboardCategoryPie";
import PercentPill from "@/components/ui/percent-pill";
import axiosInstance from "@/utils/axios";
import AutoRefresh from "./components/Dashboard/AutoRefresh";
import { SummaryResponse } from "./components/Dashboard/types/types";
import { KPIStat } from "./components/Dashboard/KPIStat";
import { fmtAR, fmtPct } from "./lib/format";
import { MapPinned, School, Table, Users } from "lucide-react";
import { TopList } from "./components/Dashboard/lists/TopList";
import { ProgressList } from "./components/Dashboard/lists/ProgressList";
import { ParticipationList } from "./components/Dashboard/lists/ParticipationList";
import { LeadersGrid } from "./components/Dashboard/LeadersGrid";



// ======= Página principal =======
export default function DashboardClient({ data: initial }: { data: SummaryResponse }) {
    const [data, setData] = useState(initial);


    // 🔁 Re-fetch suave cuando AutoRefresh dispara el evento
    useEffect(() => {
        const refetch = async () => {
            const res = await axiosInstance.get("/api/dashboard/summary", {
                // cache-buster por si algún proxy se pone vivo
                params: { ts: Date.now() },
                headers: { "Cache-Control": "no-cache" },
            });
            setData(res.data);
            // console.log("🔄 resumen actualizado", res.data); // útil para verificar que cambian valores
        };

        const h = () => void refetch();
        window.addEventListener("dashboard:refresh", h);
        return () => window.removeEventListener("dashboard:refresh", h);
    }, []);

    const { municipio, top, progreso, participacion, especiales, lideresPorCategoria } = data;
    const faltanMesas = Math.max((municipio?.mesasTotales ?? 0) - (municipio?.mesasEscrutadas ?? 0), 0);
    const specialsData = useMemo(
        () => [
            { name: "Nulos", value: especiales.nulos },
            { name: "En blanco", value: especiales.blancos },
            { name: "Recurridos", value: especiales.recurridos },
            { name: "Impugnados", value: especiales.impugnados },
            { name: "Comando Electoral", value: especiales.comando },
        ],
        [especiales]
    );
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-base font-semibold"></h1>
                <AutoRefresh intervalSec={60} /> {/* modo pro: refresh suave */}
            </div>
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <KPIStat
                    title="Mesas escrutadas de Total de mesas."
                    value={`${municipio.mesasEscrutadas} / ${municipio.mesasTotales}`}
                    sub={`${fmtPct(municipio.porcentajeEscrutado)} escrutado`}
                    icono={Table}
                >
                    <div className="mt-2 flex items-center gap-2">
                        <div className="min-w-[120px]"><Progress value={municipio.porcentajeEscrutado} /></div>
                        <PercentPill value={municipio.porcentajeEscrutado} tiers thresholds={{ low: 5, mid: 60 }} />
                    </div>
                </KPIStat>

                <KPIStat
                    title="Votantes registrados de Cantidad de electores."
                    value={`${fmtAR.format(municipio.votantesRegistrados)} / ${fmtAR.format(municipio.padronTotal)}`}
                    sub={`${fmtPct(municipio.participacionMunicipal)} del padrón`}
                    icono={Users}
                >

                </KPIStat>


                <KPIStat title="Participación municipal" value={fmtPct(municipio.participacionMunicipal)} icono={MapPinned}>
                    <div className="mt-2 flex items-center gap-2">
                        <PercentPill value={municipio.participacionMunicipal} tiers thresholds={{ low: 5, mid: 60 }} />
                    </div>
                </KPIStat>


                {/* <KPIStat title="Mesas pendientes" value={fmt.format(faltanMesas)}>
                    
                </KPIStat> */}
            </div>

            {/* Líderes por categoría */}
            <LeadersGrid items={lideresPorCategoria} />
            {/* {faltanMesas > 0 && (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 text-yellow-900 px-4 py-2 text-sm">
                    Faltan <b>{fmt.format(faltanMesas)}</b> mesas por cargar.
                </div>
            )} */}

            {/* Tops */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TopList title="Top establecimientos por votos (share municipal)" items={top.establecimientos} labelKey="establecimiento" icono={School} />
                <TopList title="Top circuitos por votos (share municipal)" items={top.circuitos} labelKey="circuito" icono={MapPinned} />
            </div>

            <Separator />

            {/* Progreso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProgressList title="Progreso por escuela" items={progreso.porEscuela} labelKey="establecimiento" icono={School} />
                <ProgressList title="Progreso por circuito" items={progreso.porCircuito} labelKey="circuito" icono={MapPinned} />
            </div>

            {/* Participación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ParticipationList title="Top participación por escuela" items={participacion.porEscuela} labelKey="establecimiento" icono={School} />
                <ParticipationList title="Top participación por circuito" items={participacion.porCircuito} labelKey="circuito" icono={MapPinned} />
            </div>

            {/* Votos especiales */}
            {/* <SpecialsDonut
                data={specialsData}
                total={especiales.total}
                pctSobreVotantes={especiales.pctSobreVotantes}
            />
            <TotalVotesByCategoryPie items={data.totalesPorCategoria} donut = {false} /> */}
            <DashboardCategoryPies
                resultados={data.resultadosCategoriaAgrupacion /* [{categoria, agrupacion, votos, logo?, color?}] */}
                categoryOrder={["CONCEJALES", "SENADORES PROVINCIALES"] /* opcional */}
                defaultVariant="donut" // o "pie"
                showControls
            />

        </div>
    );
}
