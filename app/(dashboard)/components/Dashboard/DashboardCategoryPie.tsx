// components/dashboard/DashboardCategoryPies.tsx
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart as PieIcon } from "lucide-react";
import { useCategorySorting } from "../reports/hooks/useCategorySorting";
import { useColorByPoliticalGroup } from "../reports/hooks/useColorByPoliticalGroup";
import type { Resultado } from "../reports/types/types";
import { PiesByCategory } from "../reports/charts/PiesByCategory";
import { PartyLegend } from "../reports/legends/PartyLegend";

// import type { Resultado } from "@/components/reports/VotesAccordionItem/types/types";
// import { useCategorySorting } from "@/components/reports/VotesAccordionItem/hooks/useCategorySorting";
// import { PiesByCategory } from "@/components/reports/VotesAccordionItem/charts/PiesByCategory";
// import { PartyLegend } from "@/components/reports/VotesAccordionItem/legends/PartyLegend";
// import { useColorByPoliticalGroup } from "@/components/reports/VotesAccordionItem/hooks/useColorByPoliticalGroup";

 


type Props = {
  resultados: Resultado[];          // debe venir con { categoria, agrupacion, votos, logo?, color? }
  categoryOrder?: string[];         // opcional: orden preferido de categorías
  title?: string;
  defaultVariant?: "pie" | "donut"; // default "donut"
  showControls?: boolean;           // mostrar botón para cambiar torta/dona
};

export default function DashboardCategoryPies({
  resultados,
  categoryOrder = [],
  title = "Votos por agrupación — tortas por categoría",
  defaultVariant = "donut",
  showControls = true,
}: Props) {
  const [variant, setVariant] = useState<"pie" | "donut">(defaultVariant);

  // Orden de categorías (reusa tu hook)
  const { categoriasOrdenadas } = useCategorySorting(resultados, categoryOrder);

  // Colores por agrupación (sale de Resultado.color / colorHex)
  const colorByAgrupacion = useColorByPoliticalGroup(resultados);

  // Leyenda agrupada por categoría (idéntico a lo que hacías en VotesAccordionItem)
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
          color: colorByAgrupacion.get(name.toUpperCase()) ?? "hsl(var(--muted))",
          logo: logo ?? undefined,
          value,
          percent: total > 0 ? (value / total) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value);
    });
    return out;
  }, [resultados, categoriasOrdenadas, colorByAgrupacion]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm">{title}</CardTitle>
        {showControls && (
          <Button size="sm" variant="ghost" onClick={() => setVariant(v => (v === "pie" ? "donut" : "pie"))} className="text-xs font-semibold">
            {variant === "pie" ? "Ver dona" : "Ver torta"}
            <PieIcon width={18} height={18} className="ml-1" />
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex gap-6">
          {/* Pies por categoría */}
          <div className="flex-1">
            <PiesByCategory
              resultados={resultados}
              categoriasOrdenadas={categoriasOrdenadas}
              colorByAgrupacion={colorByAgrupacion}
              variant={variant}
            />
          </div>

          {/* Leyenda a la derecha (como tu screenshot) */}
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
      </CardContent>
    </Card>
  );
}
