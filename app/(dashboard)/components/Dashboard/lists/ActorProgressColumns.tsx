"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientProgress } from "@/components/ui/GradientProgress";
import { fmtAR, fmtPct } from "@/app/(dashboard)/lib/format";
import { ProgresoItem } from "../types/types";

type Props = {
  title?: string;
  icono?: LucideIcon;
  iconClassName?: string;
  items: ProgresoItem[];
};

function splitIntoColumns<T>(items: T[], columns: number) {
  const size = Math.ceil(items.length / columns);

  return Array.from({ length: columns }, (_, i) =>
    items.slice(i * size, i * size + size)
  );
}

export function ActorProgressColumns({
  title = "Progreso por referente",
  icono: Icon,
  iconClassName = "w-4 h-4 mr-2",
  items,
}: Props) {
  const router = useRouter();

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.porcentaje !== b.porcentaje) {
        return a.porcentaje - b.porcentaje;
      }

      if (a.mesasEscrutadas !== b.mesasEscrutadas) {
        return a.mesasEscrutadas - b.mesasEscrutadas;
      }

      return (a.referente ?? "").localeCompare(b.referente ?? "", "es", {
        sensitivity: "base",
      });
    });
  }, [items]);

  const columns = useMemo(() => splitIntoColumns(sortedItems, 4), [sortedItems]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          {Icon && <Icon className={iconClassName} aria-hidden />}
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="space-y-3">
              {col.map((item, index) => {
                const disabled = !item.referenteId;

                return (
                  <button
                    key={`${item.referenteId ?? item.referente ?? "sin-ref"}-${index}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (!item.referenteId) return;

                      router.push(
                        `/actors/${item.referenteId}?name=${encodeURIComponent(
                          item.referente ?? "Referente"
                        )}`
                      );
                    }}
                    className="w-full text-left transition hover:border-primary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="truncate font-medium">
                        {item.referente ?? "Sin referente"}
                      </span>

                      <span className="text-muted-foreground">
                        <span className="mr-1 font-bold text-blue-600">
                          {fmtAR.format(item.mesasTotales)}
                        </span>
                        /
                        <span className="mx-1 font-bold text-green-600">
                          {fmtAR.format(item.mesasEscrutadas)}
                        </span>
                        /
                        <span className="ml-1 mr-2 font-bold text-red-600">
                          {fmtAR.format(item.faltan)}
                        </span>
                        — {fmtPct(item.porcentaje)}
                      </span>
                    </div>

                    <GradientProgress
                      value={item.porcentaje}
                      height={10}
                      radius={6}
                      durationMs={600}
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}