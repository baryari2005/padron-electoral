// components/dashboard/AutoRefresh.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Pause, Play } from "lucide-react";

type Props = {
  intervalSec?: number;
  initialPaused?: boolean;
  className?: string;
  /** Si se pasa, AutoRefresh la ejecuta y espera a que termine antes de reiniciar el contador */
  onRefresh?: () => Promise<void>;
  /** Si NO pasás onRefresh, se usarán eventos */
  eventName?: string;         // default: "dashboard:refresh"
  eventNameDone?: string;     // default: "dashboard:refresh:done"
};

export default function AutoRefresh({
  intervalSec = 60,
  initialPaused = false,
  className = "",
  onRefresh,
  eventName = "dashboard:refresh",
  eventNameDone = "dashboard:refresh:done",
}: Props) {
  const [left, setLeft] = useState(intervalSec);
  const [paused, setPaused] = useState(initialPaused);
  const [refreshing, setRefreshing] = useState(false);

  // si cambia el intervalo desde props, reseteamos el contador
  useEffect(() => setLeft(intervalSec), [intervalSec]);

  // Tick de 1s (no corre si está refrescando o pausado)
  useEffect(() => {
    if (paused || refreshing) return;
    const id = window.setInterval(() => {
      setLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [paused, refreshing]);

  const restart = useCallback(() => {
    setLeft(intervalSec);
    setRefreshing(false);
    // si estaba pausado manualmente, respetamos el pause
  }, [intervalSec]);

  const doRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);

    if (onRefresh) {
      // Modo callback: esperamos a que termine
      try {
        await onRefresh();
      } finally {
        restart();
      }
    } else {
      // Modo eventos: disparamos y esperamos el DONE
      window.dispatchEvent(new CustomEvent(eventName));
      const onDone = () => {
        window.removeEventListener(eventNameDone, onDone);
        restart();
      };
      window.addEventListener(eventNameDone, onDone, { once: true });
    }
  }, [refreshing, onRefresh, eventName, eventNameDone, restart]);

  // Cuando llega a 0 => refrescar
  useEffect(() => {
    if (left === 0) void doRefresh();
  }, [left, doRefresh]);

  return (
    <div className={`flex items-center gap-2 text-xs-plus text-muted-foreground ${className}`}>
      <span aria-live="polite">
        {refreshing ? "Refrescando…" : `Actualiza en ${left}s`}
      </span>

      <Button
        size="sm"
        variant="ghost"
        onClick={doRefresh}
        title="Actualizar ahora"
        aria-label="Actualizar ahora"
        disabled={refreshing}
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => setPaused((p) => !p)}
        title={paused ? "Reanudar" : "Pausar"}
        aria-label={paused ? "Reanudar" : "Pausar"}
        disabled={refreshing}
      >
        {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
      </Button>
    </div>
  );
}
