// "use client";

// import { useMemo } from "react";
// import { cn } from "@/lib/utils";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// export type VoterSeat = {
//   id: string | number;
//   position: number;       // 1..N
//   apellido: string;
//   nombre: string;
//   votedAt: string | null; // estado de DB
//   votoSiNo?: "S" | "N" | null;
// };

// type IconCmp = React.ComponentType<{ className?: string }>;

// interface VoterSeatMapProps {
//   voters: VoterSeat[];
//   pendingMap: Map<string, boolean>;
//   onToggle: (id: string, next: boolean) => void;
//   columns?: number;
//   visibleColumns?: Set<number>;
//   icons: { verde: IconCmp; rojo: IconCmp; azul: IconCmp };
//   size?: number;     // alto de celda (px)
//   iconSize?: number; // tamaño del ícono (px)
//   tooltipClassName?: string; // 👈 clases para el tooltip
// }

// export function VoterSeatMap({
//   voters,
//   pendingMap,
//   onToggle,
//   columns = 14,
//   visibleColumns,
//   icons,
//   size = 40,
//   iconSize = 20,
//   tooltipClassName = "bg-black text-white text-xs px-2 py-1 rounded shadow",
// }: VoterSeatMapProps) {
//   const byPosition = useMemo(() => {
//     const m = new Map<number, VoterSeat>();
//     for (const v of voters) m.set(v.position, v);
//     return m;
//   }, [voters]);

//   const maxPos = useMemo(() => {
//     const max = voters.length ? Math.max(...voters.map(v => v.position)) : 0;
//     const rows = Math.ceil(max / columns) || 1;
//     return rows * columns;
//   }, [voters, columns]);

//   const cellClass = `h-[${size}px]`;
//   const iconClass = `h-[${iconSize}px] w-[${iconSize}px]`;

//   return (
//     <div className="space-y-3">
//       <TooltipProvider delayDuration={150}>
//         <div
//           className="grid gap-2"
//           style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
//         >
//           {Array.from({ length: maxPos }).map((_, i) => {
//             const pos = i + 1;
//             const col = (pos - 1) % columns;
//             if (visibleColumns && !visibleColumns.has(col)) {
//               return <div key={pos} className={cellClass} />;
//             }

//             const v = byPosition.get(pos);
//             if (!v) return <div key={pos} className={cellClass} />;

//             const id = String(v.id);
//             const serverVoted = v.votoSiNo === "S";
//             const override = pendingMap.get(id);
//             const uiVoted = typeof override === "boolean" ? override : serverVoted;
//             const dirty = typeof override === "boolean" && override !== serverVoted;

//             const Icon = dirty ? icons.azul : uiVoted ? icons.verde : icons.rojo;

//             const tooltipText = `${pos}. ${v.apellido}, ${v.nombre} • ${
//               uiVoted ? "Votó" : "No votó"
//             }${dirty ? " (pend.)" : ""}`;

//             return (
//               <Tooltip key={pos}>
//                 <TooltipTrigger asChild>
//                   <button
//                     onClick={() => onToggle(id, !uiVoted)}
//                     className={cn(
//                       "rounded-md flex items-center justify-center gap-2 text-xs text-muted-foreground transition",
//                       "bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800",
//                       "border border-zinc-200 dark:border-zinc-700",
//                       dirty && "ring-2 ring-offset-2 ring-blue-400"
//                     )}
//                     style={{ height: size }}
//                   >
//                     <Icon className={iconClass} />
//                     <span className="tabular-nums">{pos}</span>
//                   </button>
//                 </TooltipTrigger>
//                 <TooltipContent side="top" align="center" className={tooltipClassName}>
//                   {tooltipText}
//                 </TooltipContent>
//               </Tooltip>
//             );
//           })}
//         </div>
//       </TooltipProvider>
//     </div>
//   );
// }
"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type VoterSeat = {
  id: string | number;
  position: number;       // 1..N
  apellido: string;
  nombre: string;
  votedAt: string | null; // estado de DB
  votoSiNo?: "S" | "N" | null;
};

type IconCmp = React.ComponentType<{ className?: string }>;

interface VoterSeatMapProps {
  voters: VoterSeat[];
  pendingMap: Map<string, boolean>;
  onToggle: (id: string, next: boolean) => void;
  columns?: number;
  visibleColumns?: Set<number>;
  icons: { verde: IconCmp; rojo: IconCmp; azul: IconCmp };
  size?: number;     // alto de celda (px)
  iconSize?: number; // tamaño del ícono (px)
  tooltipClassName?: string;
}

export function VoterSeatMap({
  voters,
  pendingMap,
  onToggle,
  columns = 14,
  visibleColumns,
  icons,
  size = 40,
  iconSize = 20,
  tooltipClassName = "bg-black text-white text-xs px-2 py-1 rounded shadow",
}: VoterSeatMapProps) {
  const byPosition = useMemo(() => {
    const m = new Map<number, VoterSeat>();
    for (const v of voters) m.set(v.position, v);
    return m;
  }, [voters]);

  const maxPos = useMemo(() => {
    const max = voters.length ? Math.max(...voters.map((v) => v.position)) : 0;
    const rows = Math.ceil(max / columns) || 1;
    return rows * columns;
  }, [voters, columns]);

  // ojo: estas clases dinámicas no las va a pickear Tailwind,
  // pero igual usamos style={{ height: size }} abajo
  const cellClass = `h-[${size}px]`;
  const iconClass = `h-[${iconSize}px] w-[${iconSize}px]`;

  return (
    <div className="space-y-3">
      <TooltipProvider delayDuration={150}>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
        >
          {Array.from({ length: maxPos }).map((_, i) => {
            const pos = i + 1;
            const col = (pos - 1) % columns;

            // columnas ocultas (mitad izq/dcha)
            if (visibleColumns && !visibleColumns.has(col)) {
              return <div key={pos} className={cellClass} style={{ height: size }} />;
            }

            const v = byPosition.get(pos);

            // 👉 AQUÍ el placeholder gris
            if (!v) {
              return (
                <div
                  key={pos}
                  className={cn(
                    "rounded-md border border-dashed border-muted/40 bg-muted/30",
                    "flex items-center justify-center text-xs text-muted-foreground",
                    "dark:bg-zinc-800/40 dark:border-zinc-700/60"
                  )}
                  style={{ height: size }}
                >
                  {/* mostramos el número para no perder la referencia */}
                   <div
                  key={pos}
                  className={cn(
                    "rounded-md border border-dashed border-muted/40 bg-muted/30",
                    "flex flex-col items-center justify-center text-[10px] text-muted-foreground gap-1",
                    "dark:bg-zinc-800/40 dark:border-zinc-700/60"
                  )}
                  style={{ height: size }}
                >
                  <span className="tabular-nums text-xs font-medium">{pos}</span>
                  <span className="leading-none">SIN VOTANTE</span>
                </div>
                </div>
              );
            }

            const id = String(v.id);
            const serverVoted = v.votoSiNo === "S";
            const override = pendingMap.get(id);
            const uiVoted = typeof override === "boolean" ? override : serverVoted;
            const dirty = typeof override === "boolean" && override !== serverVoted;

            const Icon = dirty ? icons.azul : uiVoted ? icons.verde : icons.rojo;

            const tooltipText = `${pos}. ${v.apellido}, ${v.nombre} • ${
              uiVoted ? "Votó" : "No votó"
            }${dirty ? " (pend.)" : ""}`;

            return (
              <Tooltip key={pos}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onToggle(id, !uiVoted)}
                    className={cn(
                      "rounded-md flex items-center justify-center gap-2 text-xs text-muted-foreground transition",
                      "bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800",
                      "border border-zinc-200 dark:border-zinc-700",
                      dirty && "ring-2 ring-offset-2 ring-blue-400"
                    )}
                    style={{ height: size }}
                  >
                    <Icon className={iconClass} />
                    <span className="tabular-nums">{pos}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className={tooltipClassName}>
                  {tooltipText}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
