"use client";

import { BellRing } from "lucide-react";

export function TextStatsLoader() {
  return (
    <div className="text-sm text-muted-foreground px-4">
      {/* Icono + título en una sola línea */}
      <div className="flex items-center justify-center gap-2 font-medium">
        <BellRing className="w-4 h-4 shrink-0 animate-pulse" />
        <span className="font-semibold animate-pulse">
          Recordatorio: recalcular estadísticas.
        </span>
      </div>

      {/* Descripción debajo */}
      <p className="text-[13px] leading-5 text-center mt-1 animate-pulse">
        Luego de correr la importación, corré el módulo de Estadísticas para ver
        totales y conteos actualizados por mesa, establecimiento y circuito.
      </p>
    </div>
  );
}
