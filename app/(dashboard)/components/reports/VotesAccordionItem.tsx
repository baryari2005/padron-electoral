// components/reports/VotesAccordionItem/index.tsx
"use client";
import { useMemo, useState, type ReactNode } from "react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Layers, PieChart as PieIcon, ChartColumnBig, ChartColumnStacked, Eye, EyeOff } from "lucide-react";

import { Ranking } from "../../reports/components/Ranking";
import { buildChartData } from "./utils/chartUtils";
import { useCategorySorting } from "./hooks/useCategorySorting";
import { useColorByAgrupacion } from "./hooks/useColorByAgrupacion";
import { PiesByCategory } from "./charts/PiesByCategory";
import { BarsByCategory } from "./charts/BarsByCategory";
import { SpecialVotesChart } from "./specials/SpecialVotesChart";

import type { Resultado, Resumen, VotoEspecial } from "./types/types";
import { PartyLegend } from "./legends/PartyLegend";

export function VotesAccordionItem({
  ...props
}: {
  value: string; icon: ReactNode; title: ReactNode; resumen?: Resumen;
  resultados: Resultado[]; votosEspeciales: VotoEspecial[]; categoryOrder: string[];
  stacked: boolean; onToggleStacked: () => void;
}) {
  const { value, icon, title, resumen, resultados, votosEspeciales, categoryOrder, stacked, onToggleStacked } = props;

  const [mostrarVotosEspeciales, setMostrarVotosEspeciales] = useState(false);
  const [view, setView] = useState<"bars" | "pies">("pies");
  const [pieVariant, setPieVariant] = useState<"pie" | "donut">("pie");
  const [legendPlacement, setLegendPlacement] = useState<"bottom" | "right">("right"); // ← si querés fija a la derecha

  const chartData = useMemo(() => buildChartData(resultados), [resultados]);
  const { categoriasOrdenadas, sortCategorias } = useCategorySorting(resultados, categoryOrder);
  const { colorByAgrupacion } = useColorByAgrupacion(resultados);

  // Legend agrupada por categoría (para tortas)
  const groupedLegendItems = useMemo(() => {
    const byCat = new Map<string, Map<string, { value: number; logo?: string | null }>>();
    resultados.forEach(r => {
      const cat = (r.categoria ?? "").trim();
      const agr = (r.agrupacion ?? "").trim();
      if (!cat || !agr) return;
      let inner = byCat.get(cat);
      if (!inner) { inner = new Map(); byCat.set(cat, inner); }
      const prev = inner.get(agr)?.value ?? 0;
      inner.set(agr, { value: prev + (r.votos ?? 0), logo: inner.get(agr)?.logo ?? r.logo ?? null });
    });

    const out: Record<string, { name: string; color: string; logo?: string | null; value: number; percent: number }[]> = {};
    categoriasOrdenadas.forEach(cat => {
      const m = byCat.get(cat) ?? new Map();
      const total = Array.from(m.values()).reduce((a, b) => a + (b.value ?? 0), 0);
      out[cat] = Array.from(m.entries())
        .map(([name, { value, logo }]) => ({
          name,
          color: colorByAgrupacion.get(name) ?? "hsl(var(--muted))",
          logo: logo ?? undefined,
          value,
          percent: total > 0 ? (value / total) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value);
    });
    return out;
  }, [resultados, categoriasOrdenadas, colorByAgrupacion]);

  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="px-4 no-underline hover:no-underline text-muted-foreground hover:text-primary">
        <CardTitle className="flex text-sm">
          <span className="flex items-center text-muted-foreground">
            <span className="mr-4">{icon}</span>
            {title}
            <span className="flex items-center text-xs ml-8">
              <Layers width={15} height={15} className="mr-4" />
              {resumen ? `Votantes: ${resumen?.electoresVotaron ?? "-"} - Sobres: ${resumen?.sobresEnUrna ?? "-"}` : "Sin datos"}
            </span>
          </span>
        </CardTitle>
      </AccordionTrigger>

      <AccordionContent>
        <Card className="mt-2 border-none">
          <CardContent className="space-y-4">
            {/* Controles */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                {view === "pies" ? "Votos por agrupación — tortas por categoría" : "Votos por agrupación y categoría"}
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setView(v => (v === "pies" ? "bars" : "pies"))} className="text-xs font-semibold">
                  Ver {view === "pies" ? "barras" : "tortas"}
                  {view === "pies" ? <ChartColumnBig width={18} height={18} className="ml-1" /> : <PieIcon width={18} height={18} className="ml-1" />}
                </Button>
                {view === "pies" && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => setPieVariant(p => (p === "pie" ? "donut" : "pie"))} className="text-xs font-semibold">
                      {pieVariant === "pie" ? "Ver dona" : "Ver torta"}
                      <PieIcon width={18} height={18} className="ml-1" />
                    </Button>
                    {/* si querés fijo a la derecha, podés borrar este botón */}
                    <Button size="sm" variant="ghost" onClick={() => setLegendPlacement(p => (p === "bottom" ? "right" : "bottom"))} className="text-xs font-semibold">
                      Leyenda {legendPlacement === "bottom" ? "a la derecha" : "abajo"}
                    </Button>
                  </>
                )}
                {view === "bars" && (
                  <Button size="sm" variant="ghost" onClick={onToggleStacked} className="text-xs font-semibold">
                    {stacked ? "Apilado" : "Lado a lado"}
                    <ChartColumnStacked width={18} height={18} className="ml-1" />
                  </Button>
                )}
              </div>
            </div>

            {/* === CONTENIDO: SOLO mostramos Ranking en BARRAS === */}
            {view === "bars" ? (
              <div className="grid grid-cols-1 xl:grid-cols-[70%_30%] gap-6">
                <div className="h-80">
                  <BarsByCategory
                    chartData={chartData}
                    categoriasOrdenadas={categoriasOrdenadas}
                    stacked={stacked}
                  />
                </div>
                {/* ✅ Ranking SOLO en barras */}
                <Ranking resultados={resultados} categoryOrder={categoryOrder} />
              </div>
            ) : (
              // Vista de tortas: sin Ranking. Usamos leyenda abajo o a la derecha.
              legendPlacement === "right" ? (
                <div className="flex gap-6">
                  <div className="flex-1">
                    <PiesByCategory
                      resultados={resultados}
                      categoriasOrdenadas={categoriasOrdenadas}
                      colorByAgrupacion={colorByAgrupacion}
                      variant={pieVariant}
                    />
                  </div>
                  <PartyLegend
                    groups={groupedLegendItems}
                    placement="right"
                    className="w-64 shrink-0"
                    showValues
                    valueLabel="votos"
                    fractionDigits={1}
                    square
                  />
                </div>
              ) : (
                <>
                  <PiesByCategory
                    resultados={resultados}
                    categoriasOrdenadas={categoriasOrdenadas}
                    colorByAgrupacion={colorByAgrupacion}
                    variant={pieVariant}
                  />
                  <PartyLegend
                    groups={groupedLegendItems}
                    placement="bottom"
                    className="pt-2"
                    showValues
                    valueLabel="votos"
                    fractionDigits={1}
                    square
                  />
                </>
              )
            )}

            {/* Votos especiales */}
            <Separator />
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm font-semibold">Votos especiales por categoría</p>
              <Button size="sm" variant="ghost" onClick={() => setMostrarVotosEspeciales(prev => !prev)}>
                {mostrarVotosEspeciales ? <Eye width={20} height={20} /> : <EyeOff width={20} height={20} />}
                {mostrarVotosEspeciales ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
            {mostrarVotosEspeciales && (
              <div className="h-80">
                <SpecialVotesChart
                  votosEspeciales={votosEspeciales}
                  ordenarCategorias={sortCategorias}
                  stacked={stacked}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
