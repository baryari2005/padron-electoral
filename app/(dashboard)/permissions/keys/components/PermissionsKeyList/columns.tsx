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
            accessorKey: "descripcion",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Descripción
                        <ArrowUpDown className="w-4 h-4 ml-2" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "accion",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Acción
                        <ArrowUpDown className="w-4 h-4 ml-2" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "modulo",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Modulo
                        <ArrowUpDown className="w-4 h-4 ml-2" />
                    </Button>
                )
            },
        },

        buildActionsColumn({ component: "permissions/keys", label: "permiso", onDeleted }),
    ];

    return baseColumns;
};