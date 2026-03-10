"use client";

import { ColumnDef } from "@tanstack/react-table";
import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";
import { Eleccion } from "@prisma/client";
import { sortableHeader } from "@/app/(dashboard)/components/table/SortableHeader";

interface ColumnsProps {
  onDeleted?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const columns = ({
  onDeleted,
  canEdit,
  canDelete,
}: ColumnsProps): ColumnDef<Eleccion>[] => {
  return [
    {
      accessorKey: "nombre",
      header: sortableHeader("Nombre"),
    },
    {
      accessorKey: "tipo",
      header: sortableHeader("Tipo"),
    },
    {
      accessorKey: "estado",
      header: sortableHeader("Estado"),
    },
    {
      accessorKey: "activa",
      header: "Activa",
      cell: ({ row }) => (row.original.activa ? "✅" : "—"),
    },
    buildActionsColumn({
      component: "elections",
      label: "elecciones",
      onDeleted,
      canEdit,
      canDelete,
    }),
  ];
};