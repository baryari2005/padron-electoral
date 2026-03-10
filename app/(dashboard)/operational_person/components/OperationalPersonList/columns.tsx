'use client'

import { ColumnDef } from "@tanstack/react-table";
import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";
import { CargoPolitico, PersonaOperativa } from "@prisma/client";
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
}: ColumnsProps): ColumnDef<PersonaOperativa>[] => {
  const baseColumns: ColumnDef<PersonaOperativa>[] = [
    {
      accessorKey: "nombre",
      header: sortableHeader("Nombre"),
    },
    {
      accessorKey: "tipo",
      header: sortableHeader("Tipo"),
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
    },
    buildActionsColumn({ component: "operational_person", label: "actor político", onDeleted, canEdit, canDelete }),
  ];

  return baseColumns;
};
