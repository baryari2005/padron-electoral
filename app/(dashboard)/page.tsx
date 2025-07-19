"use client";

import CardSummary from "./components/CardSummary/CardSummary";
import { BookOpenCheck, UsersRound, Waypoints } from "lucide-react";
import { LastCustomers } from "@/app/(dashboard)/components/LastCustomers";
import { SalesDistributors } from "@/app/(dashboard)/components/SalesDistributors";
import { TotalSuscribers } from "@/app/(dashboard)/components/TotalSuscribers";
import { ListIntegrations } from "@/app/(dashboard)/components/ListIntegrations";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const cardData = [
  {
    icon: UsersRound,
    total: "12.450",
    average: 15,
    title: "Companis",
    tooltipText: "See all of the companies created",
  },
  {
    icon: Waypoints,
    total: "86.5%",
    average: 80,
    title: "Total Revenue",
    tooltipText: "See all of the summary",
  },
  {
    icon: BookOpenCheck,
    total: "86.5%",
    average: 30,
    title: "Bounce Rate",
    tooltipText: "See all of the bounce rate",
  },
];

export default function Home() {
   const { loading } = useAuthRedirect();

  if (loading) {
    return <div className="p-10 text-center">Verificando acceso...</div>; // loader simple
  }

  return (
    <div>
      <h2 className="text-2xl mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-x-20">
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
      <div className="grid grid-cols-1 xl:grid-cols-2 md:gap-x-10 mt-12">
        <LastCustomers />
        <SalesDistributors />
      </div>
      <div className="flex-col md:gap-x-10 xl:flex xl:flex-row 
                gap-y-4 md:gap-y-0 mt-12 md:mb-10 justify-center">
        <TotalSuscribers />
        <ListIntegrations />
      </div>
    </div>
  );
}
