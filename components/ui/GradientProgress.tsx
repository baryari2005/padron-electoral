// components/ui/GradientProgress.tsx
"use client";

import { memo } from "react";

type Props = {
  /** 0–100 */
  value: number;
  /** alto en px (default 8px) */
  height?: number;
  /** radio en px (default 9999 = pill) */
  radius?: number;
  /** animar ancho (ms) */
  durationMs?: number;
  className?: string;
};

export const GradientProgress = memo(function GradientProgress({
  value,
  height = 8,
  radius = 9999,
  durationMs = 300,
  className = "",
}: Props) {
  const pct = Math.max(0, Math.min(100, value));

  // Mapeo 0..100 → 0..120 (rojo→verde)
  const hue = Math.round((pct / 100) * 120);
  const dynamic = `hsl(${hue} 90% 45%)`;

  // Gradiente suave: rojo → amarillo → color dinámico (cerca de verde al 100)
  const gradient = `linear-gradient(90deg,
    hsl(0 85% 55%) 0%,
    hsl(45 95% 50%) 50%,
    ${dynamic} 100%
  )`;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={`w-full bg-muted overflow-hidden ${className}`}
      style={{ height, borderRadius: radius }}
    >
      <div
        className="h-full"
        style={{
          width: `${pct}%`,
          background: gradient,
          transition: `width ${durationMs}ms ease`,
        }}
      />
    </div>
  );
});

/* OPCIONALES */
{/* <GradientProgress value={x.porcentaje} height={10} />
Sin “pill”:

tsx
Copiar código
<GradientProgress value={x.porcentaje} radius={6} />
Animación más lenta:

tsx
Copiar código
<GradientProgress value={x.porcentaje} durationMs={600} /> */}
