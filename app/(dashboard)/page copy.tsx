// // app/(dashboard)/page.tsx
// "use client";

// import { UsersRound, BookOpenCheck, Waypoints, AlertTriangle } from "lucide-react";
// import { useAuthRedirect } from "@/hooks/useAuthRedirect";
// import { AuthRehydrationProvider } from "./components/AuthRehydrationProvider/AuthRehydrationProvider";
// import { AlertCard } from "./components/AlertCard/AlertCard";
// import SummaryPieChartByCategory from "./components/reports/SummaryPieChartByCategory";
// import { RankingCategoryGridFromTable } from "./components/reports/RankingCategoryGrid";

// import { useDashboardStats } from "./scrutiny-certificates/hooks/useDashboardStats";
// import { useCertificatesSummary } from "./scrutiny-certificates/hooks/useCertificatesSummary";
// import { RankingListCard } from "./scrutiny-certificates/components/RankingListCard";
// import { useRankingsFromSummary } from "./scrutiny-certificates/hooks/useRankingsFromSummary";

// const nf = (n: number) => n.toLocaleString("es-AR");
// const pf = (n: number) => `${n.toFixed(1)}%`;

// export default function Home() {
//   const { loading: authLoading } = useAuthRedirect();
//   const { escuelas, loading: summaryLoading } = useCertificatesSummary();

//   // ⬇️ AGREGA ESTAS DOS CONSTANTES (o traelas de tu API)
//   const TOTAL_MESAS_ESPERADAS = 252;  // <-- reemplazá con el real
//   const PADRON_TOTAL = 31340;         // <-- reemplazá con el real

//   // ⬇️ PASALAS AL HOOK (en vez de null)
//   const {
//     mesasEscrutadas,
//     habilitadas,
//     porcentajeEscrutado,
//     votantesRegistrados,
//     porcentajeParticipacion,
//     deltaEscrutado,
//   } = useDashboardStats({
//     escuelas,                                 // TODAS
//     totalMesasHabilitadas: TOTAL_MESAS_ESPERADAS,
//     padronTotal: PADRON_TOTAL,
//     storageKey: "sc:dashboard-stats:global",
//   });

//   const { rankEstablecimientos, rankCircuitos } = useRankingsFromSummary(escuelas, { top: 5 });
//   const faltan = Math.max((habilitadas || 0) - mesasEscrutadas, 0);

//   if (authLoading || summaryLoading) return <AuthRehydrationProvider />;

//   return (
//     <div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-x-6">
//         {/* Mesas escrutadas (X / total) */}
//         <div className="rounded-xl border bg-card p-4">
//           <div className="text-sm text-muted-foreground flex items-center gap-2">
//             <UsersRound className="h-4 w-4" />
//             Mesas escrutadas
//           </div>
//           <div className="mt-2 flex items-end gap-2">
//             <div className="text-2xl font-semibold">
//               {nf(mesasEscrutadas)} / {nf(habilitadas || TOTAL_MESAS_ESPERADAS)}
//             </div>
//             <span className="rounded-md bg-black text-white text-[10px] px-2 py-[2px]">
//               {pf(porcentajeEscrutado)}
//             </span>
//           </div>
//         </div>

//         {/* Votantes registrados (X / padrón) */}
//         <div className="rounded-xl border bg-card p-4">
//           <div className="text-sm text-muted-foreground flex items-center gap-2">
//             <Waypoints className="h-4 w-4" />
//             Votantes registrados
//           </div>
//           <div className="mt-2 flex items-end gap-2">
//             <div className="text-2xl font-semibold">
//               {nf(votantesRegistrados)} / {nf(PADRON_TOTAL)}
//             </div>
//             <span className="rounded-md bg-black text-white text-[10px] px-2 py-[2px]">
//               {porcentajeParticipacion != null ? pf(porcentajeParticipacion) : "—"}
//             </span>
//           </div>
//         </div>

//         {/* Porcentaje escrutado (solo %) */}
//         <div className="rounded-xl border bg-card p-4">
//           <div className="text-sm text-muted-foreground flex items-center gap-2">
//             <BookOpenCheck className="h-4 w-4" />
//             Porcentaje escrutado
//           </div>
//           <div className="mt-2 flex items-end gap-2">
//             <div className="text-2xl font-semibold">{pf(porcentajeEscrutado)}</div>
//             {deltaEscrutado != null && (
//               <span className="rounded-md bg-black text-white text-[10px] px-2 py-[2px]">
//                 {`${deltaEscrutado >= 0 ? "+" : ""}${deltaEscrutado.toFixed(1)} pts`}
//               </span>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Rankings */}
//       <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <RankingListCard title="Top establecimientos por votos (share municipal)" items={rankEstablecimientos} />
//         <RankingListCard title="Top circuitos por votos (share municipal)" items={rankCircuitos} />
//       </div>

//       {/* aviso de faltantes */}
//       {faltan > 0 && (
//         <div className="mt-6">
//           <AlertCard tipo="warning" mensaje={`Faltan ${faltan} mesas por cargar.`} icon={AlertTriangle} />
//         </div>
//       )}

//       <div className="mt-6 mb-6">
//         <SummaryPieChartByCategory />
//       </div>

//       <RankingCategoryGridFromTable />
//     </div>
//   );
// }
