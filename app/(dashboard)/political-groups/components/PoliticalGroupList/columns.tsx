"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AgrupacionPolitica } from "@prisma/client";
import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";
import { AvatarLogo } from "@/app/(dashboard)/components/common/AvatarLogo";
import { sortableHeader } from '../../../components/table/SortableHeader';

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
                const imageUrl: string | null = row.original.profileImage ?? null;
                return (
                    <AvatarLogo
                        src={imageUrl}
                        alt={`Logo de ${row.original?.nombre ?? "agrupación política"}`}
                        size={30}
                    />
                );
            },
        },
        {
            accessorKey: "numero",
            header: "Número",
            cell: ({ row }) => row.original.numero
        },
        {
            accessorKey: "nombre",
            header: sortableHeader("Agrupación Política"),

        },
        {
            accessorKey: "color_hex",
            header: "Color",
            cell: ({ row }) => {
                const hex = row.original.color_hex || "#000000";
                return (
                    <span
                        className="inline-block h-5 w-5 rounded-full border border-border shadow-sm"
                        style={{ backgroundColor: hex }}
                        title={hex}
                    />
                );
            },
        },
        {
            accessorKey: "orden",
            header: "Orden",
            cell: ({ row }) => row.original.orden
        },
        buildActionsColumn({ component: "political-groups", label: "agrupación política", onDeleted, canEdit, canDelete }),
    ];

    return baseColumns;
};

