'use client'

import { ColumnDef } from "@tanstack/react-table";
import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";
import { CargoPolitico } from "@prisma/client";
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
}: ColumnsProps): ColumnDef<CargoPolitico>[] => {
  const baseColumns: ColumnDef<CargoPolitico>[] = [
    {
      accessorKey: "nombre",
      header: sortableHeader("Nombre"),
    },
    buildActionsColumn({ component: "categories", label: "cargo político", onDeleted, canEdit, canDelete }),
  ];

  return baseColumns;
};
