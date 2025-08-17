// // components/reports/VotesAccordionItem.tsx
// "use client";

// import {
//   AccordionItem,
//   AccordionTrigger,
//   AccordionContent,
// } from "@/components/ui/accordion";
// import { Card, CardContent, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Button } from "@/components/ui/button";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   CartesianGrid,
//   PieChart as RPieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import {
//   ChartColumnBig,
//   ChartColumnStacked,
//   Eye,
//   EyeOff,
//   Layers,
//   PieChart as PieIcon,
// } from "lucide-react";
// import { useMemo, useState, type ReactNode } from "react";

// import {
//   buildChartData,
//   buildChartDataVotosEspeciales,
//   getCategoriasUnicas,
//   getColor,
//   getColorEspecial,
//   getTiposEspecialesUnicos,
// } from "./utils/chartUtils";
// import {
//   createCustomLogoTick,
//   CustomTooltip,
//   CustomLegend,
// } from "@/app/(dashboard)/reports/components";
// import { Ranking } from "../../reports/components/Ranking";

// type Resultado = {
//   categoria: string;
//   agrupacion: string;
//   votos: number;
//   logo?: string | null;
// };

// type Resumen =
//   | { electoresVotaron?: number; sobresEnUrna?: number }
//   | null
//   | undefined;

// type VotoEspecial = any;

// export type VotesAccordionItemProps = {
//   value: string;
//   icon: ReactNode;
//   title: ReactNode;
//   resumen?: Resumen;

//   resultados: Resultado[];
//   votosEspeciales: VotoEspecial[];

//   categoryOrder: string[];

//   stacked: boolean;
//   onToggleStacked: () => void;
// };

// // Paleta (usa tus CSS vars de shadcn)
// const COLORS = [
//   "hsl(var(--chart-1))",
//   "hsl(var(--chart-2))",
//   "hsl(var(--chart-3))",
//   "hsl(var(--chart-4))",
//   "hsl(var(--chart-5))",
// ];

// const RADIAN = Math.PI / 180;
// function renderPieLabel(props: any) {
//   const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
//   const r = innerRadius + (outerRadius - innerRadius) * 0.52;
//   const x = cx + r * Math.cos(-midAngle * RADIAN);
//   const y = cy + r * Math.sin(-midAngle * RADIAN);
//   const pct = Math.round((percent ?? 0) * 100);

//   return (
//     <text
//       x={x}
//       y={y}
//       textAnchor={x > cx ? "start" : "end"}
//       dominantBaseline="central"
//       fill="#333"
//       style={{ pointerEvents: "none" }}
//       className="text-xs font-semibold"
//     >
//       {name} {pct}%
//     </text>
//   );
// }

// export function VotesAccordionItem({
//   value,
//   icon,
//   title,
//   resumen,
//   resultados,
//   votosEspeciales,
//   categoryOrder,
//   stacked,
//   onToggleStacked,
// }: VotesAccordionItemProps) {
//   const [mostrarVotosEspeciales, setMostrarVotosEspeciales] = useState(false);
//   const [view, setView] = useState<"bars" | "pies">("pies"); // 👈 tortas por categoría

//   // === Datos para BARRAS (como tenías) ===
//   const chartData = useMemo(() => buildChartData(resultados), [resultados]);

//   // Orden de categorías (series, orden visual y para grid de tortas)
//   const orderMap = useMemo(() => {
//     const m = new Map<string, number>();
//     categoryOrder.forEach((n, i) => m.set(n.toUpperCase(), i));
//     return m;
//   }, [categoryOrder]);
//   const sortCategorias = (a: string, b: string) =>
//     (orderMap.get(a.toUpperCase()) ?? 1e9) -
//     (orderMap.get(b.toUpperCase()) ?? 1e9);
//   const categoriasOrdenadas = useMemo(
//     () => getCategoriasUnicas(resultados).sort(sortCategorias),
//     [resultados, orderMap]
//   );

//   // === Datos para TORTAS POR CATEGORÍA ===
//   // 1) colores estables por agrupación (misma agrupación = mismo color en todas las tortas)
//   const agrupacionesOrdenadas = useMemo(() => {
//     const set = new Set<string>();
//     for (const r of resultados) if (r.agrupacion) set.add(r.agrupacion);
//     return Array.from(set).sort((a, b) => a.localeCompare(b));
//   }, [resultados]);

//   const colorByAgrupacion = useMemo(() => {
//     const map = new Map<string, string>();
//     agrupacionesOrdenadas.forEach((name, i) =>
//       map.set(name, COLORS[i % COLORS.length])
//     );
//     return map;
//   }, [agrupacionesOrdenadas]);

//   // 2) agrupar por categoría -> array de { name: agrupacion, value: votos }
// const piesPorCategoria = useMemo(() => {
//   const byCat = new Map<string, Map<string, number>>();

//   // build: categoría -> (agrupación -> votos)
//   resultados.forEach((r) => {
//     const cat = (r.categoria ?? "").trim();
//     const agr = (r.agrupacion ?? "").trim();
//     if (!cat || !agr) return;
//     let m = byCat.get(cat);
//     if (!m) {
//       m = new Map<string, number>();
//       byCat.set(cat, m);
//     }
//     m.set(agr, (m.get(agr) ?? 0) + (r.votos ?? 0));
//   });

//   // flatten sin for..of sobre iteradores
//   const out: Record<string, { name: string; value: number }[]> = {};
//   byCat.forEach((m, cat) => {
//     const arr: { name: string; value: number }[] = [];
//     m.forEach((value, name) => {
//       if (value > 0) arr.push({ name, value });
//     });
//     arr.sort((a, b) => b.value - a.value);
//     out[cat] = arr;
//   });

//   return out;
// }, [resultados]);

//   // === VOTOS ESPECIALES (igual) ===
//   const dataVotosEspecialesOrdenado = useMemo(() => {
//     const raw = buildChartDataVotosEspeciales(votosEspeciales);
//     return [...raw].sort((a, b) =>
//       sortCategorias(String(a.categoria), String(b.categoria))
//     );
//   }, [votosEspeciales, orderMap]);

//   const tiposEspecialesOrdenados = useMemo(
//     () =>
//       getTiposEspecialesUnicos(votosEspeciales).sort((a, b) =>
//         a.localeCompare(b)
//       ),
//     [votosEspeciales]
//   );

//   return (
//     <AccordionItem value={value}>
//       <AccordionTrigger className="px-4 no-underline hover:no-underline text-muted-foreground hover:text-primary">
//         <CardTitle className="flex text-sm">
//           <span className="flex items-center text-muted-foreground">
//             <span className="mr-4">{icon}</span>
//             {title}
//             <span className="flex items-center text-xs ml-8">
//               <Layers width={15} height={15} className="mr-4" />
//               {resumen
//                 ? `Votantes: ${resumen?.electoresVotaron ?? "-"} - Sobres: ${
//                     resumen?.sobresEnUrna ?? "-"
//                   }`
//                 : "Sin datos"}
//             </span>
//           </span>
//         </CardTitle>
//       </AccordionTrigger>

//       <AccordionContent>
//         <Card className="mt-2 border-none">
//           <CardContent className="space-y-4">
//             <div className="flex items-center justify-between">
//               <p className="text-sm font-semibold">
//                 {view === "pies"
//                   ? "Votos por agrupación — tortas por categoría"
//                   : "Votos por agrupación y categoría"}
//               </p>

//               <div className="flex items-center gap-1">
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   onClick={() =>
//                     setView((v) => (v === "pies" ? "bars" : "pies"))
//                   }
//                   className="text-xs font-semibold"
//                 >
//                   Ver {view === "pies" ? "barras" : "tortas por categoría"}
//                   {view === "pies" ? (
//                     <ChartColumnBig width={18} height={18} className="ml-1" />
//                   ) : (
//                     <PieIcon width={18} height={18} className="ml-1" />
//                   )}
//                 </Button>

//                 {view === "bars" && (
//                   <Button
//                     size="sm"
//                     variant="ghost"
//                     onClick={onToggleStacked}
//                     className="text-xs font-semibold"
//                   >
//                     {stacked ? "Apilado" : "Lado a lado"}
//                     <ChartColumnStacked
//                       width={18}
//                       height={18}
//                       className="ml-1"
//                     />
//                   </Button>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 xl:grid-cols-[70%_30%] gap-6">
//               {/* === CHART AREA === */}
//               <div className={view === "pies" ? "space-y-6" : "h-80"}>
//                 {view === "pies" ? (
//                   // 🥧 grid de tortas por categoría
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                     {categoriasOrdenadas.map((cat) => {
//                       const data = piesPorCategoria[cat] ?? [];
//                       if (data.length === 0) {
//                         return (
//                           <div key={cat} className="rounded-md border p-4">
//                             <p className="text-xs font-semibold text-muted-foreground uppercase text-center">
//                               {cat}
//                             </p>
//                             <div className="text-xs text-muted-foreground text-center mt-4">
//                               Sin datos
//                             </div>
//                           </div>
//                         );
//                       }
//                       return (
//                         <div key={cat} className="rounded-md border p-4">
//                           <p className="text-xs font-semibold text-muted-foreground uppercase text-center">
//                             {cat}
//                           </p>
//                           <div className="h-64 mt-2">
//                             <ResponsiveContainer width="100%" height="100%">
//                               <RPieChart>
//                                 <Tooltip
//                                   formatter={(v: number, n: string) =>
//                                     [`${v} votos`, n]
//                                   }
//                                   wrapperStyle={{ pointerEvents: "none" }}
//                                 />
//                                 {/* Legend opcional: muchas tortas = mucho ruido, por eso la omito */}
//                                 <Pie
//                                   data={data}
//                                   dataKey="value"
//                                   nameKey="name"
//                                   cx="50%"
//                                   cy="50%"
//                                   innerRadius={50}
//                                   outerRadius={90}
//                                   labelLine={false}
//                                   label={renderPieLabel}
//                                 >
//                                   {data.map((d, i) => (
//                                     <Cell
//                                       key={`${cat}-${d.name}-${i}`}
//                                       fill={
//                                         colorByAgrupacion.get(d.name) ||
//                                         COLORS[i % COLORS.length]
//                                       }
//                                     />
//                                   ))}
//                                 </Pie>
//                               </RPieChart>
//                             </ResponsiveContainer>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   // 📊 barras (tu versión original)
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={chartData}>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                       <XAxis
//                         dataKey="agrupacion"
//                         tick={createCustomLogoTick(chartData)}
//                         interval={0}
//                         height={40}
//                       />
//                       <YAxis tickLine={false} axisLine={true} />
//                       <Tooltip
//                         content={<CustomTooltip />}
//                         wrapperStyle={{ pointerEvents: "none", zIndex: 0 }}
//                       />
//                       <Legend
//                         content={<CustomLegend label="Cargos políticos:" />}
//                       />
//                       {categoriasOrdenadas.map((cat) => (
//                         <Bar
//                           key={cat}
//                           dataKey={cat}
//                           stackId={stacked ? "a" : undefined}
//                           fill={getColor(cat)}
//                         />
//                       ))}
//                     </BarChart>
//                   </ResponsiveContainer>
//                 )}
//               </div>

//               {/* Ranking */}
//               <Ranking resultados={resultados} categoryOrder={categoryOrder} />
//             </div>

//             {/* === VOTOS ESPECIALES === */}
//             <Separator />
//             <div className="flex justify-between items-center mt-4">
//               <p className="text-sm font-semibold">
//                 Votos especiales por categoría
//               </p>
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 onClick={() => setMostrarVotosEspeciales((prev) => !prev)}
//               >
//                 {mostrarVotosEspeciales ? (
//                   <EyeOff width={20} height={20} />
//                 ) : (
//                   <Eye width={20} height={20} />
//                 )}
//                 {mostrarVotosEspeciales ? "Ocultar" : "Mostrar"}
//               </Button>
//             </div>

//             {mostrarVotosEspeciales && (
//               <div className="h-80">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={dataVotosEspecialesOrdenado}>
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                     <XAxis dataKey="categoria" tick={{ dy: 12 }} />
//                     <YAxis tickLine={false} axisLine={true} />
//                     <Tooltip
//                       content={<CustomTooltip />}
//                       wrapperStyle={{ pointerEvents: "none", zIndex: 0 }}
//                     />
//                     <Legend
//                       content={<CustomLegend label="Votos especiales:" />}
//                     />
//                     {tiposEspecialesOrdenados.map((tipo) => (
//                       <Bar
//                         key={tipo}
//                         dataKey={tipo}
//                         stackId={stacked ? "a" : undefined}
//                         fill={getColorEspecial(tipo)}
//                       />
//                     ))}
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </AccordionContent>
//     </AccordionItem>
//   );
// }
