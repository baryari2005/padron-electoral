// components/reports/charts/renderPercentLabel.tsx
"use client";
import type { PieLabelRenderProps } from "recharts";

const RAD = Math.PI / 180;
const toNum = (v: unknown) =>
  typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : 0;

export function renderPercentLabel(raw: PieLabelRenderProps) {
  const cx = toNum(raw.cx);
  const cy = toNum(raw.cy);
  const innerRadius = toNum(raw.innerRadius);
  const outerRadius = toNum(raw.outerRadius);
  const midAngle = toNum(raw.midAngle);
  const percent =
    typeof raw.percent === "number" ? raw.percent : toNum(raw.percent);

  // Punto óptico dentro del sector (sirve para pie y dona)
  const r =
    innerRadius > 0
      ? innerRadius + (outerRadius - innerRadius) * 0.5
      : outerRadius * 0.62;

  const a = -midAngle * RAD;
  const x = cx + r * Math.cos(a);
  const y = cy + r * Math.sin(a);

  const pct = Math.round((percent ?? 0) * 100);
  if (pct <= 0) return null;           // opcional: ocultar porciones 0%

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fill="#fff"                       // blanco
      fontWeight={700}
      style={{ pointerEvents: "none" }}
      stroke="rgba(0,0,0,.35)"          // contorno para legibilidad
      strokeWidth={2}
      paintOrder="stroke"
    >
      {pct}%
    </text>
  );
}
