'use client'

import { Circuito } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
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
    canDelete,
}: ColumnsProps): ColumnDef<Circuito>[] => {
    const baseColumns: ColumnDef<Circuito>[] = [
        {
            accessorKey: "codigo",
            header: sortableHeader("Código"),
        },
        {
            accessorKey: "nombre",
            header: sortableHeader("Nombre"),
        },

        buildActionsColumn({ component: "circuites", label: "circuito", onDeleted, canEdit, canDelete }),
    ];

    return baseColumns;
};