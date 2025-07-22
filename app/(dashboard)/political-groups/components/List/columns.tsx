"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AgrupacionPolitica } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { TableActions } from "@/components/ui/tableActions";

interface ColumnsProps {
    onDeleted?: () => void;
}
export const columns = ({ onDeleted }: ColumnsProps): ColumnDef<AgrupacionPolitica>[] => [
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
    {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
            const { id } = row.original;

            return (
                <TableActions
                    id={id.toString()}
                    editUrl={`/political-groups/${id}`}
                    deleteUrl={`/api/political-groups/${id}`}
                    resourceName="Agrupación Política"
                    confirmTitle="¿Eliminar esta agrupación política?"
                    confirmDescription="Esta acción eliminará permanentemente la agrupación política. ¿Continuar?"
                    confirmActionLabel="Eliminar"
                    onDeleted={() => onDeleted?.()}
                />
            );
        },
    },
];
