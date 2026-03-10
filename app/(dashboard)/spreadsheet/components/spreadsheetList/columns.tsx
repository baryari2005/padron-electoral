"use client";

import type { Planilla } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";
import { sortableHeader } from "@/app/(dashboard)/components/table/SortableHeader";

interface ColumnsProps {
  onDeleted?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const columns = ({ 
  onDeleted, 
  canEdit, 
  canDelete }: ColumnsProps): ColumnDef<Planilla>[] => {
  const baseColumns: ColumnDef<Planilla>[] =
    [
      {
        accessorKey: "numero",
        header: sortableHeader("Número"),
      },
      {
        accessorKey: "nombre",
        header: sortableHeader("Nombre"),
      },
      buildActionsColumn({ component: "spreadsheet", label: "planilla", onDeleted, canEdit, canDelete }),
    ];

  return baseColumns;
};