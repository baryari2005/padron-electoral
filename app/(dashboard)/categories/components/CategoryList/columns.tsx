'use client'

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";
import { CargoPolitico } from "@prisma/client";

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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cargo Político
          <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
    },
    buildActionsColumn({ component: "categories", label: "cargo político", onDeleted, canEdit, canDelete }),
  ];

  return baseColumns;
};
