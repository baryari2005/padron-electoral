'use client'

import { Button } from "@/components/ui/button";
import { Role } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react";
import { TableActions } from "@/components/ui/tableActions";

interface ColumnsProps {
    onDeleted?: () => void;
}

export const columns = ({ onDeleted }: ColumnsProps): ColumnDef<Role>[] => [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Role
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
                    editUrl={`/roles/${id}`}
                    deleteUrl={`/api/roles/${id}`}
                    resourceName="Rol"
                    confirmTitle="¿Eliminar este rol?"
                    confirmDescription="Esta acción eliminará permanentemente el rol. ¿Continuar?"
                    confirmActionLabel="Eliminar"
                    onDeleted={() => onDeleted?.()}
                />
            );
        }
    }
]