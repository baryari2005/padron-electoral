"use client";

import { PieChart, Pie, Sector, ResponsiveContainer, Tooltip, SectorProps } from "recharts";
import { useState } from "react";
import { DataItem } from "../common/types/votes.types";
import { AvatarLogo } from "../common/AvatarLogo";

interface Props {
  data: DataItem[];
}

type Coordinate = { x: number; y: number };
type PieSectorData = {
  percent?: number;
  name?: string | number;
  midAngle?: number;
  middleRadius?: number;
  tooltipPosition?: Coordinate;
  value?: number;
  paddingAngle?: number;
  dataKey?: string;
  payload?: any;
};
type PieSectorDataItem = React.SVGProps<SVGPathElement> & Partial<SectorProps> & PieSectorData;

const renderActiveShape = ({
  cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value,
}: PieSectorDataItem) => {
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * (midAngle ?? 1));
  const cos = Math.cos(-RADIAN * (midAngle ?? 1));
  const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;
  const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;
  const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;
  const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} pointerEvents="none">
        {payload.name}
      </text>

      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={(outerRadius ?? 0) + 6} outerRadius={(outerRadius ?? 0) + 10} fill={fill} />

      <text
        x={cx}
        y={(cy ?? 0) + 10}  // <-- corregido
        textAnchor="middle"
        fill="#333"
        className="text-sm font-semibold"
        pointerEvents="none"
      >
        {`${value} votos`}
      </text>

      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs font-semibold" pointerEvents="none">
        {`${value} Votos`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs" pointerEvents="none">
        {`(${((percent ?? 1) * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export function CustomActiveShapePieChart({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const agrupacionActiva = data[activeIndex];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-2 max-w-[400px] px-2 text-muted-foreground">
        <AvatarLogo src={agrupacionActiva?.logo} alt={agrupacionActiva?.nombre} size={24} />
        <span className="text-sm font-semibold text-center break-words">{agrupacionActiva?.nombre}</span>
      </div>

      {/* Contenedor con tamaño -> ResponsiveContainer usa 100%/100% */}
      <div className="w-full h-72"> 
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="totalVotos"
              nameKey="nombre"
              onMouseEnter={(_, i) => setActiveIndex(i)}
            />
            {/* <Tooltip formatter={(v: number) => `${v} votos`} wrapperStyle={{ pointerEvents: "none" }} /> */}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
