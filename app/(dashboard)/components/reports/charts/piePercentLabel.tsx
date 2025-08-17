// charts/piePercentLabel.tsx
"use client";

const RAD = Math.PI / 180;

export function renderPercentInside({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) {
  const r = (innerRadius ?? 0) + ((outerRadius ?? 0) - (innerRadius ?? 0)) * 0.6;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  const p = Math.round(((percent ?? 0) * 100));

  // ocultá etiquetas muy chicas para evitar solapado
  if (p < 5) return null;

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill="#fff"
      style={{ pointerEvents: "none" }}
      fontSize={12}
      fontWeight={600}
    >
      {p}%
    </text>
  );
}
