"use client";

import CardSummary from "./components/CardSummary/CardSummary";
import { UsersRound, BookOpenCheck, Waypoints, AlertTriangle } from "lucide-react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { AuthRehydrationProvider } from "./components/AuthRehydrationProvider/AuthRehydrationProvider";
import { AlertCard } from "./components/AlertCard/AlertCard";
import { CategoriaRanking } from "./components/CategoryRaking/CategoryRanking";
import ResumenTortasPorCategoriaConCustom from "./components/Charts/ResumenTortasPorCategoriaConCustom";

const cardData = [
  {
    icon: UsersRound,
    total: "240",
    average: 15,
    title: "Mesas escrutadas",
    tooltipText: "Cantidad total de mesas cargadas en el sistema",
  },
  {
    icon: Waypoints,
    total: "21.340",
    average: 80,
    title: "Votantes registrados",
    tooltipText: "Cantidad de personas que participaron",
  },
  {
    icon: BookOpenCheck,
    total: "98.5%",
    average: 30,
    title: "Porcentaje escrutado",
    tooltipText: "Proporción de mesas procesadas sobre el total esperado",
  },
];

export default function Home() {
  const { loading } = useAuthRedirect();

  if (loading) {
    return <AuthRehydrationProvider />;
  }

  return (
    <div>
      {/* <h2 className="text-3xl font-bold mb-6">Informe general de votación</h2> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-x-6">
        {cardData.map((card, index) => (
          <CardSummary
            key={index}
            icon={card.icon}
            total={card.total}
            average={card.average}
            title={card.title}
            tooltipText={card.tooltipText}
          />
        ))}
      </div>

      <div className="mt-10">
        <AlertCard tipo="warning" mensaje="Faltan 12 mesas por cargar." icon={AlertTriangle} />
      </div>

      <div className="mt-6">        
        <ResumenTortasPorCategoriaConCustom />        
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full mt-6">
        
          <CategoriaRanking categoria="DIPUTADOS" />
          <CategoriaRanking categoria="SENADORES" />
        
      </div>
    </div>

  );
}
