"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ChartColumnBig, ChartColumnStacked, Eye, EyeOff, Layers, School } from "lucide-react";

import { MesaVoteSummary } from "./types";
import { MesaRanking } from './MesaRanking';
import {
  buildChartData,
  buildChartDataVotosEspeciales,  
  getCategoriasUnicas,
  getColor,
  getColorEspecial,
  getTiposEspecialesUnicos,
} from "../../utils/chartUtils";

import { useState } from "react";

import { createCustomLogoTick, CustomTooltip, CustomLegend } from "@/app/(dashboard)/reports/components";


interface MesaAccordionItemProps {
  mesa: MesaVoteSummary;
  stacked: boolean;
  onToggleStacked: () => void;
}

export function MesaAccordionItem({
  mesa,
  stacked,
  onToggleStacked,
}: MesaAccordionItemProps) {
  const [mostrarVotosEspeciales, setMostrarVotosEspeciales] = useState(false);

  const chartData = buildChartData(mesa.resultados);
  const ordenCategorias = ["DIPUTADOS", "SENADORES"];
  
  return (
    <AccordionItem key={mesa.mesaId} value={`mesa-${mesa.mesaId}`} >
      <AccordionTrigger className="px-4 no-underline hover:no-underline text-muted-foreground hover:text-primary">
        <CardTitle className="flex text-sm">
          <p>
            <span className="flex text-muted-foreground ">
              <School width={20} height={20} className="mr-4" />
              {mesa.establecimiento} - Mesa {mesa.numero}
              <span className="flex items-center text-xs">
                <Layers width={15} height={15} className="ml-8 mr-4" />
                {mesa.resumen
                  ? `Votantes: ${mesa.resumen.electoresVotaron} - Sobres: ${mesa.resumen.sobresEnUrna}`
                  : "Sin datos"}
              </span>
            </span>
          </p>
        </CardTitle>
      </AccordionTrigger>
      <AccordionContent>
        <Card className="mt-2 border-none">
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                Votos por agrupación y categoría
              </p>
              <Button size="sm" variant="ghost" onClick={onToggleStacked} className="text-xs font-semibold">
                Ver {stacked ? "barras" : "combinado"}
                {stacked ? <ChartColumnBig width={20} height={20} /> : <ChartColumnStacked width={20} height={20} />}
              </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[70%_30%] gap-6">
              {/* Gráfico */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="agrupacion"
                      tick={createCustomLogoTick(chartData)}
                      interval={0}
                      height={40}
                    />
                    <YAxis tickLine={false} axisLine={true} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend label="Cargos políticos:" />} />
                    {getCategoriasUnicas(mesa.resultados).map((cat) => (
                      <Bar
                        key={cat}
                        dataKey={cat}
                        stackId={stacked ? "a" : undefined}
                        fill={getColor(cat)}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <MesaRanking resultados={mesa.resultados} />
            </div>

            {/* Votos especiales */}
            <Separator />
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm font-semibold">Votos especiales por categoría</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setMostrarVotosEspeciales((prev) => !prev)}
              >
                {mostrarVotosEspeciales ? <EyeOff width={20} height={20} /> : <Eye width={20} height={20} />}
                {mostrarVotosEspeciales ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
            {mostrarVotosEspeciales && (
              <>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buildChartDataVotosEspeciales(mesa.votosEspeciales)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="categoria" tick={{ dy: 12 }} />
                      <YAxis tickLine={false} axisLine={true} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend content={<CustomLegend label="Votos especiales:" />} />
                      {getTiposEspecialesUnicos(mesa.votosEspeciales).map((tipo) => (
                        <Bar
                          key={tipo}
                          dataKey={tipo}
                          stackId={stacked ? "a" : undefined}
                          fill={getColorEspecial(tipo)}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
