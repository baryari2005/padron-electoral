// components/reports/VotesAccordionItem/legend/PartyLegend.tsx
"use client";

export type LegendItem = {
  name: string;
  color: string;
  logo?: string | null;
  value?: number;    // votos
  percent?: number;  // 0..100
};

export function PartyLegend({
  items,
  groups,
  className = "",
  placement = "right",      // "bottom" | "right"
  showValues = true,
  valueLabel = "votos",
  fractionDigits = 1,
  square = true,             // cuadradito por defecto
  logoSize = 14,
}: {
  /** Leyenda plana (sin agrupar) */
  items?: LegendItem[];
  /** Leyenda agrupada por categoría: { "CONCEJALES": [...], "SENADORES": [...] } */
  groups?: Record<string, LegendItem[]>;
  className?: string;
  placement?: "bottom" | "right";
  showValues?: boolean;
  valueLabel?: string;
  fractionDigits?: number;
  square?: boolean;
  logoSize?: number;
}) {
  const isRight = placement === "right";

  const Chip = ({ color }: { color: string }) => (
    <span
      className={`inline-block ${square ? "w-3 h-3 rounded-[3px]" : "w-2.5 h-2.5 rounded-full"} ring-1 ring-black/10`}
      style={{ background: color }}
      aria-hidden
    />
  );

  const ItemInline = ({ it }: { it: LegendItem }) => (
    <div className="flex items-center gap-2 min-w-0">
      <Chip color={it.color} />
      {it.logo ? (
        <img
          src={it.logo}
          alt={it.name}
          width={logoSize}
          height={logoSize}
          className="rounded-sm object-contain"
        />
      ) : null}
      <span className="text-xs text-muted-foreground truncate max-w-[14ch] sm:max-w-[20ch]">
        {it.name}
      </span>
      {showValues && (
        <>
          <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
            {(it.value ?? 0).toLocaleString()} {valueLabel}
          </span>
          
          <span className="text-xs font-semibold text-muted-foreground tabular-nums whitespace-nowrap">
            ({(it.percent ?? 0).toFixed(fractionDigits)}%)
          </span>
        </>
      )}
    </div>
  );

  // Render fila de grupo: "CONCEJALES" + items en la misma línea (y con wrap si no entra)
  const GroupRow = ({ title, data }: { title: string; data: LegendItem[] }) => (
    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mr-2 mb-1 mt-2">
        {title}
      </span>
      {data.map((it) => (
        <ItemInline key={`${title}-${it.name}`} it={it} />
      ))}
    </div>
  );

  return (
    <div
      className={[
        className,
        isRight ? "max-h-84 overflow-auto pr-1" : "",
      ].join(" ")}
      aria-label="Leyenda por agrupación"
    >
      {groups
        ? Object.entries(groups).map(([title, data]) => (
            <GroupRow key={title} title={title} data={data} />
          ))
        : items && (
            <div className={isRight ? "space-y-2" : "flex flex-wrap gap-x-4 gap-y-2"}>
              {items.map((it) => (
                <ItemInline key={it.name} it={it} />
              ))}
            </div>
          )}
    </div>
  );
}
