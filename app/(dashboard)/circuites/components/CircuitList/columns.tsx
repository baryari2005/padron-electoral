'use client'

import { Button } from "@/components/ui/button";
import { Circuito } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react";
import { TableActions } from "@/components/ui/tableActions";
import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";

interface ColumnsProps {
    onDeleted?: () => void;
    canEdit?: boolean;
    canDelete?: boolean;
}

export const columns = ({
    onDeleted,
    canEdit,
    canDelete,
}: ColumnsProps): ColumnDef<Circuito>[] => {
    const baseColumns: ColumnDef<Circuito>[] = [
        {
            accessorKey: "codigo",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Código
                        <ArrowUpDown className="w-4 h-4 ml-2" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "nombre",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Nombre
                        <ArrowUpDown className="w-4 h-4 ml-2" />
                    </Button>
                )
            },
        },
        buildActionsColumn({ component: "circuites", label: "circuito", onDeleted, canEdit, canDelete }),
    ];

  return baseColumns;
};