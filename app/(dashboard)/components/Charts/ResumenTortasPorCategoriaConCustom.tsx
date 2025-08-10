"use client";

import { useEffect, useState, useMemo } from "react";
import axiosInstance from "@/utils/axios";
import { CustomActiveShapePieChart } from "./CustomActiveShapePieChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface Resultado {
  categoria: string;
  agrupacion: string;
  logo: string;
  votos: number;
}

interface AgrupacionConTotales {
  nombre: string;
  totalVotos: number;
  logo: string;
}

function agrupacionLider(data: AgrupacionConTotales[]) {
  return data.reduce((max, curr) => (curr.totalVotos > max.totalVotos ? curr : max), data[0]);
}

export default function ResumenTortasPorCategoriaConCustom() {
  const [resultados, setResultados] = useState<Resultado[]>([]);

  useEffect(() => {
    axiosInstance
      .get("/api/reports/total-vote-summary")
      .then((res) => setResultados(res.data.resultados))
      .catch(console.error);
  }, []);

  // Agrupar por categoría y luego por agrupación
  const datosPorCategoria: Record<string, AgrupacionConTotales[]> = useMemo(() => {
    const agrupado: Record<string, Map<string, AgrupacionConTotales>> = {};

    for (const r of resultados) {
      const categoria = r.categoria.trim();
      const agrupacion = r.agrupacion.trim();

      if (!agrupado[categoria]) {
        agrupado[categoria] = new Map();
      }

      const mapaAgrupaciones = agrupado[categoria];

      if (!mapaAgrupaciones.has(agrupacion)) {
        mapaAgrupaciones.set(agrupacion, {
          nombre: agrupacion,
          totalVotos: r.votos,
          logo: r.logo,
        });
      } else {
        const actual = mapaAgrupaciones.get(agrupacion)!;
        actual.totalVotos += r.votos;
      }
    }

    const resultadoFinal: Record<string, AgrupacionConTotales[]> = {};
    for (const [categoria, mapa] of Object.entries(agrupado)) {
      resultadoFinal[categoria] = Array.from(mapa.values());
    }

    return resultadoFinal;
  }, [resultados]);

  const ordenPersonalizado = ["DIPUTADOS", "SENADORES"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
      {Object.entries(datosPorCategoria)
        .sort(([a], [b]) => ordenPersonalizado.indexOf(a) - ordenPersonalizado.indexOf(b))
        .map(([categoria, data]) => (
          <Card key={categoria} className="shadow-sm bg-background rounded-lg p-5 py-0 hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="text-center uppercase text-muted-foreground text-base">
                {categoria}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-2 text-muted-foreground font-semibold text-green-400 text-xs">                
                <Trophy className="w-4 h-4 mr-2"/>
                {agrupacionLider(data)?.nombre} - {agrupacionLider(data)?.totalVotos} VOTOS
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center w-full">
              <div className="w-full max-w-[360px]">
                <CustomActiveShapePieChart data={data} />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
