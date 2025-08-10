'use client'

import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";
import { Button } from "@/components/ui/button";
import { Rol } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react";

interface ColumnsProps {
    onDeleted?: () => void;
    canEdit?: boolean;
    canDelete?: boolean;
}

export const columns = ({ onDeleted, canEdit, canDelete, }: ColumnsProps): ColumnDef<Rol>[] => {
    const baseColumns: ColumnDef<Rol>[] = [
        {
            accessorKey: "nombre",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Rol
                        <ArrowUpDown className="w-4 h-4 ml-2" />
                    </Button>
                )
            },
        },
        buildActionsColumn({ component: "roles", label: "rol", onDeleted, canEdit, canDelete }),
    ];

    return baseColumns;
};
