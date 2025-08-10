import Image from "next/image";
import { TooltipProps } from "recharts";

export function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<any, any>) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const logo = data.logo; // ← asumimos que viene así

  return (
    <div className="bg-white p-3 shadow-md rounded text-sm min-w-[200px]">
      {/* Label con logo al lado */}
      <div className="flex items-center gap-2 mb-4">
        {logo && (
          <Image
            src={logo}
            alt="logo"
            className="w-5 h-5 object-contain rounded-sm"
          />
        )}
        <p className="font-semibold text-muted-foreground truncate text-sm">{label}</p>
      </div>

      {/* Valores por categoría */}
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex justify-between gap-2">
          <span style={{ color: entry.color }} className="truncate font-semibold text-xs">
            {entry.name}
          </span>
          <span className="text-right font-semibold text-xs">{entry.value} votos</span>
        </div>
      ))}
    </div>
  );
}
