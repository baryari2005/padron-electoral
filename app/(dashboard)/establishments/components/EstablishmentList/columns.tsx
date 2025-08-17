'use client';

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Establecimiento, Circuito } from "@prisma/client";
import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";
import { AvatarLogo } from "@/app/(dashboard)/components/common/AvatarLogo";
import { sortableHeader } from "@/app/(dashboard)/components/table/SortableHeader";

interface ColumnsProps {
  onDeleted?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export type EstablecimientoConCircuito = Establecimiento & {
  circuito: Circuito | null;
}

const collator = new Intl.Collator("es", { numeric: true, sensitivity: "base" });

export const columns = ({
  onDeleted,
  canEdit,
  canDelete,
}: ColumnsProps
): ColumnDef<EstablecimientoConCircuito>[] => {
  const baseColumns: ColumnDef<EstablecimientoConCircuito>[] = [
    {
      accessorKey: "profileImage",
      header: "Logo",
      cell: ({ row }) => {
        const imageUrl: string | null = row.original.profileImage ?? null;
        return (
          <AvatarLogo
            src={imageUrl}
            alt={`Logo de ${row.original?.nombre ?? "establecimiento"}`}
            size={40}
          />
        );
      },
    },
    {
      accessorKey: "nombre",
      header: sortableHeader("Nombre"),
    },
    {
      accessorKey: "direccion",
      header: sortableHeader("Dirección"),
    },
    {
      id: "circuitoCodigo",
      accessorFn: (row) => row.circuito?.codigo ?? null, // <-- valor a ordenar
      header: sortableHeader("Circuito"),
      cell: ({ getValue }) => {
        const codigo = (getValue() as string | null) ?? null;
        return (
          <span className="text-sm">
            {codigo ? codigo : <span className="italic text-muted-foreground">Sin circuito</span>}
          </span>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const a = (rowA.getValue<string | null>(columnId)) ?? "";
        const b = (rowB.getValue<string | null>(columnId)) ?? "";
        // vacíos al final
        if (!a && !b) return 0;
        if (!a) return 1;
        if (!b) return -1;
        return collator.compare(a, b);
      },
    },
    buildActionsColumn({ component: "establishments", label: "establecimiento", onDeleted, canEdit, canDelete }),
  ];

  return baseColumns;

};
