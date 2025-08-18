"use client";
const RADIAN = Math.PI / 180;

export function renderPieLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
  const r = innerRadius + (outerRadius - innerRadius) * 0.52;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  const pct = Math.round((percent ?? 0) * 100);

  return (
    <text
      x={x}
      y={y}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fill="#333"
      style={{ pointerEvents: "none" }}
      className="text-xs font-semibold"
    >
      {name} {pct}%
    </text>
  );
}
