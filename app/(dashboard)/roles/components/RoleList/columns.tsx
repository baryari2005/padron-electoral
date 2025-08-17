'use client'

import { sortableHeader } from "@/app/(dashboard)/components/table/SortableHeader";
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
            header: sortableHeader("Rol"),
        },
        buildActionsColumn({ component: "roles", label: "rol", onDeleted, canEdit, canDelete }),
    ];

    return baseColumns;
};
