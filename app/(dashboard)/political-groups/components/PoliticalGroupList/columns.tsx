"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AgrupacionPolitica } from "@prisma/client";
import { Button } from "@/components/ui/button";
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
}: ColumnsProps): ColumnDef<AgrupacionPolitica>[] => {
    const baseColumns: ColumnDef<AgrupacionPolitica>[] = [
        {
            accessorKey: "profileImage",
            header: "Logo",
            cell: ({ row }) => {
                const imageUrl = row.original.profileImage;
                return imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="Logo de la Agrupación Política"
                        className="h-10 w-10 rounded-full object-cover"
                    />
                ) : (
                    <span className="text-sm text-muted-foreground italic">Sin imagen</span>
                );
            }
        },
        {
            accessorKey: "numero",
            header: "Número",
            cell: ({ row }) => row.original.numero
        },
        {
            accessorKey: "nombre",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Agrupación Política
                        <ArrowUpDown className="w-4 h-4 ml-2" />
                    </Button>
                )
            },
        },
        buildActionsColumn({ component: "political-groups", label: "agrupación política", onDeleted, canEdit, canDelete }),
    ];

    return baseColumns;
};

