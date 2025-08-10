'use client';

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Establecimiento, Circuito } from "@prisma/client";
import { TableActions } from "@/components/ui/tableActions";
import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";

interface ColumnsProps {
  onDeleted?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export type EstablecimientoConCircuito = Establecimiento & {
  circuito: Circuito | null;
}

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
        const imageUrl = row.original.profileImage;
        return imageUrl ? (
          <img
            src={imageUrl}
            alt="Logo del establecimiento"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm text-muted-foreground italic">Sin imagen</span>
        );
      },
    },
    {
      accessorKey: "nombre",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
    },
    {
      accessorKey: "direccion",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dirección
          <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
    },
    {
      id: "circuito",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Circuito
          <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
      cell: ({ row }) => {
        const circuito = row.original.circuito;
        return (
          <span className="text-sm">
            {circuito
              ? `${circuito.codigo} - ${circuito.nombre}`
              : <span className="italic text-muted-foreground">Sin circuito</span>}
          </span>
        );
      },
    },
    buildActionsColumn({ component: "establishments", label: "establecimiento", onDeleted, canEdit, canDelete }),
  ];

  return baseColumns;

};
