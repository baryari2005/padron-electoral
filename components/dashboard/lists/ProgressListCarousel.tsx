// components/dashboard/lists/ProgressListCarousel.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fmtPct } from "@/app/(dashboard)/lib/format";
import { ProgresoItem } from "@/app/(dashboard)/components/Dashboard/types/types";


type Props = {
  title: string;
  items: ProgresoItem[];
  labelKey: "establecimiento" | "circuito";
  icono?: LucideIcon;
  iconClassName?: string;
  /** Tamaño de página (default 10) */
  pageSize?: number;
  /** Avance automático en ms (default 5000) */
  intervalMs?: number;
  /** Pausar al hacer hover (default true) */
  pauseOnHover?: boolean;
  /** Mostrar controles y dots (default true) */
  showControls?: boolean;
  /** Loop al final (default true) */
  loop?: boolean;
};

export function ProgressListCarousel({
  title,
  items,
  labelKey,
  icono: Icon,
  iconClassName = "w-4 h-4 mr-2",
  pageSize = 10,
  intervalMs = 5000,
  pauseOnHover = true,
  showControls = true,
  loop = true,
}: Props) {
  const pages = useMemo(() => {
    const out: ProgresoItem[][] = [];
    for (let i = 0; i < items.length; i += pageSize) {
      out.push(items.slice(i, i + pageSize));
    }
    return out;
  }, [items, pageSize]);

  const totalPages = pages.length;
  const [page, setPage] = useState(0);
  const [hover, setHover] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Autoplay
  useEffect(() => {
    if (totalPages <= 1) return;            // nada que paginar
    if (pauseOnHover && hover) return;      // pausado por hover
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
  }, [totalPages, intervalMs, pauseOnHover, hover, loop]);

  // Si no supera una página, render clásico
  if (totalPages <= 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
            {Icon && <Icon className={iconClassName} aria-hidden />}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.slice(0, pageSize).map((x, idx) => (
            <div key={`${labelKey}-${idx}`}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium truncate">{(x as any)[labelKey]}</span>
                <span className="text-muted-foreground">
                  {x.mesasEscrutadas}/{x.mesasTotales} — {fmtPct(x.porcentaje)}
                </span>
              </div>
              <Progress value={x.porcentaje} />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Carrusel
  return (
    <Card
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-live="polite"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          {Icon && <Icon className={iconClassName} aria-hidden />}
          {title}
          <span className="ml-auto text-xs text-muted-foreground">
            {page + 1}/{totalPages}
          </span>
        </CardTitle>
      </CardHeader>

      <div className="relative">
        {/* Página actual */}
        <CardContent
          key={page} // fuerza transición simple
          className="space-y-4 transition-opacity duration-300"
        >
          {pages[page].map((x, idx) => (
            <div key={`${labelKey}-${page}-${idx}`}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium truncate">{(x as any)[labelKey]}</span>
                <span className="text-muted-foreground">
                  {x.mesasEscrutadas}/{x.mesasTotales} — {fmtPct(x.porcentaje)}
                </span>
              </div>
              <Progress value={x.porcentaje} />
            </div>
          ))}
        </CardContent>

        {/* Controles */}
        {showControls && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              onClick={() => setPage((p) => (p + 1) % totalPages)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
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
