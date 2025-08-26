// components/dashboard/AutoRefresh.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Pause, Play } from "lucide-react";

type Props = {
  /** Segundos entre actualizaciones */
  intervalSec?: number;
  /** Nombre del CustomEvent que se emite para refrescar datos */
  eventName?: string; // ej: "dashboard:refresh"
  /** Arranca pausado */
  initialPaused?: boolean;
  className?: string;
};

export default function AutoRefresh({
  intervalSec = 60,
  eventName = "dashboard:refresh",
  initialPaused = false,
  className = "",
}: Props) {
  const [left, setLeft] = useState(intervalSec);
  const [paused, setPaused] = useState(initialPaused);

  // Tick de 1s
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [paused]);

  // Cuando llega a 0, emite el evento y reinicia contador
  useEffect(() => {
    if (left !== 0) return;
    window.dispatchEvent(new CustomEvent(eventName));
    setLeft(intervalSec);
  }, [left, eventName, intervalSec]);

  const triggerNow = () => {
    window.dispatchEvent(new CustomEvent(eventName));
    setLeft(intervalSec);
  };

  return (
    <div className={`flex items-center gap-2 text-xs-plus text-muted-foreground animate-pulse ${className}`}>
      <span aria-live="polite">Actualiza en {left}s</span>

      <Button
        size="sm"
        variant="ghost"
        onClick={triggerNow}
        title="Actualizar ahora"
        aria-label="Actualizar ahora"
      >
        <RefreshCw className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => setPaused((p) => !p)}
        title={paused ? "Reanudar" : "Pausar"}
        aria-label={paused ? "Reanudar" : "Pausar"}
      >
        {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
      </Button>
    </div>
  );
}
