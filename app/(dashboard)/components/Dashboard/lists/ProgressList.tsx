// components/dashboard/lists/ProgressList.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgresoItem } from "../types/types";
import { fmtPct } from "@/app/(dashboard)/lib/format";
import { GradientProgress } from "@/components/ui/GradientProgress";

export type ProgressListProps = {
  title: string;
  items: ProgresoItem[];
  labelKey: "establecimiento" | "circuito" | "referente";
  /** Ítems por página (también se usa para el modo estático) */
  limit?: number;
  icono?: LucideIcon;
  iconClassName?: string;
  /** --- Opcional: modo carrusel --- */
  autoCarousel?: boolean;   // default false
  intervalMs?: number;      // default 5000
  pauseOnHover?: boolean;   // default true
  loop?: boolean;           // default true
  showControls?: boolean;   // default true
};

export function ProgressList({
  title,
  items,
  labelKey,
  limit = 10,
  icono: Icon,
  iconClassName = "w-4 h-4 mr-2",
  autoCarousel = false,
  intervalMs = 5000,
  pauseOnHover = true,
  loop = true,
  showControls = true,
}: ProgressListProps) {
  // Paginado
  const pages = useMemo(() => {
    if (!autoCarousel) return [items.slice(0, limit)];
    const out: ProgresoItem[][] = [];
    for (let i = 0; i < items.length; i += limit) out.push(items.slice(i, i + limit));
    return out.length ? out : [[]];
  }, [items, limit, autoCarousel]);

  const totalPages = pages.length;
  const [page, setPage] = useState(0);
  const [hover, setHover] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Autoplay
  useEffect(() => {
    if (!autoCarousel) return;
    if (totalPages <= 1) return;
    if (pauseOnHover && hover) return;

    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setPage((p) => {
        const next = p + 1;
        if (next < totalPages) return next;
        return loop ? 0 : p;
      });
    }, intervalMs);

    return () => {
      timerRef.current && clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoCarousel, totalPages, intervalMs, pauseOnHover, hover, loop]);

  const header = (
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className={iconClassName} aria-hidden />}
        {title}
        {autoCarousel && totalPages > 1 && (
          <span className="ml-auto text-xs text-muted-foreground">{page + 1}/{totalPages}</span>
        )}
      </CardTitle>
    </CardHeader>
  );

  // Modo estático (igual que antes)
  if (!autoCarousel || totalPages <= 1) {
    const list = pages[0] ?? [];
    return (
      <Card>
        {header}
        <CardContent className="space-y-4">
          {list.map((x, idx) => (
            <div key={`${labelKey}-${idx}`}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium truncate">{(x as any)[labelKey]}</span>
                <span className="text-muted-foreground">
                  {x.mesasEscrutadas}/{x.mesasTotales} — {fmtPct(x.porcentaje)}
                </span>
              </div>
              {/* <Progress value={x.porcentaje} /> */}
              <GradientProgress value={x.porcentaje} height={10} radius={6} durationMs={600}/>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Modo carrusel
  return (
    <Card
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-live="polite"
    >
      {header}

      <div className="relative">
        <CardContent key={page} className="space-y-4 transition-opacity duration-300">
          {pages[page].map((x, idx) => (
            <div key={`${labelKey}-${page}-${idx}`}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium truncate">{(x as any)[labelKey]}</span>
                <span className="text-muted-foreground">
                  {x.mesasEscrutadas}/{x.mesasTotales} — {fmtPct(x.porcentaje)}
                </span>
              </div>
              {/* <Progress value={x.porcentaje} /> */}
              <GradientProgress value={x.porcentaje} height={10} radius={6} durationMs={600}/>
            </div>
          ))}
        </CardContent>

        {showControls && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted"
            >
              {/* podés usar un icono si querés */}
              ‹
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              onClick={() => setPage((p) => (p + 1) % totalPages)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted"
            >
              ›
            </button>

            <div className="flex items-center justify-center gap-1 pb-3">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  aria-label={`Ir a página ${i + 1}`}
                  onClick={() => setPage(i)}
                  className={[
                    "h-1.5 rounded-full transition-all",
                    i === page ? "w-6 bg-foreground/70" : "w-2 bg-foreground/30 hover:bg-foreground/50",
                  ].join(" ")}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
