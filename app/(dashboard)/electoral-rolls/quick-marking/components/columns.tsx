import { ColumnDef } from "@tanstack/react-table";
import { Elector } from "./types";

export function buildColumns(
  pendingMap: Map<string, boolean>,
  onToggle: (electorId: string, nextVoted: boolean) => void
): ColumnDef<Elector>[] {
  return [
    {
      accessorKey: "dni",
      header: "DNI",
      size: 120,
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.numeroMatricula}</span>
      ),
    },
    { accessorKey: "apellido", header: "Apellido", cell: ({ row }) => row.original.apellido },
    { accessorKey: "nombre", header: "Nombre", cell: ({ row }) => row.original.nombre },

    {
      id: "estado",
      header: "Estado",
      size: 160,
      cell: ({ row }) => {
        const e = row.original;
        const id = String(e.id);
        const override = pendingMap.get(id);
        const serverVoted = e.votoSiNo === "S";
        const effectiveVoted = typeof override === "boolean" ? override : serverVoted;
        const dirty = typeof override === "boolean" && override !== serverVoted;

        return (
          <span
            className={[
              "text-xs px-2 py-1 rounded whitespace-nowrap",
              effectiveVoted ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800",
            ].join(" ")}
            title={dirty ? "Cambio pendiente de guardar" : undefined}
          >
            {effectiveVoted ? "VOTÓ" : "NO VOTÓ"}
            {dirty ? " (pend.)" : ""}
          </span>
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      size: 160,
      cell: ({ row }) => {
        const e = row.original;
        const id = String(e.id);
        const override = pendingMap.get(id);
        const serverVoted = Boolean(e.votedAt);
        const effectiveVoted = typeof override === "boolean" ? override : serverVoted;

        return (
          <button
            className={`h-8 px-3 rounded border transition ${
              effectiveVoted ? "bg-gray-900 text-white hover:opacity-90" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => onToggle(id, !effectiveVoted)}
          >
            {effectiveVoted ? "Desmarcar" : "Marcar"}
          </button>
        );
      },
    },

    // // 🧪 4) Columna de debug (temporal). Sacala después.
    // {
    //   id: "debug",
    //   header: "🧪",
    //   size: 260,
    //   cell: ({ row }) => {
    //     const e = row.original as any;
    //     const id = String(e.id);
    //     const override = pendingMap.get(id);
    //     const serverVoted = Boolean(e.votedAt);
    //     const effectiveVoted = typeof override === "boolean" ? override : serverVoted;
    //     const dirty = typeof override === "boolean" && override !== serverVoted;
    //     // log
    //     console.log("DBG row", { id, votedAt: e.votedAt, override, serverVoted, effectiveVoted, dirty });
    //     return (
    //       <code className="text-[11px] leading-4">
    //         id:{id} • server:{String(serverVoted)} • ov:{String(override)} • ui:{String(effectiveVoted)} {dirty ? "•*" : ""}
    //       </code>
    //     );
    //   },
    // },
  ];
}
