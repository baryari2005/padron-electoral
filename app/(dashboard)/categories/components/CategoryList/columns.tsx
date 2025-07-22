'use client'

import { Button } from "@/components/ui/button";
import { Categoria } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react";
import { TableActions } from "@/components/ui/tableActions";

interface ColumnsProps {
    onDeleted?: () => void;
}

export const columns = (
    { onDeleted }: ColumnsProps
): ColumnDef<Categoria>[] => [
        {
            accessorKey: "nombre",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Categoria
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
                const component = "categories";

                return (
                    <TableActions
                        id={id.toString()}
                        editUrl={`/${component}/${id}`}
                        deleteUrl={`/api/${component}/${id}`}
                        resourceName="Categoría"
                        confirmTitle="¿Eliminar esta categoría?"
                        confirmDescription="Esta acción eliminará permanentemente la categoría. ¿Continuar?"
                        confirmActionLabel="Eliminar"
                        onDeleted={() => onDeleted?.()}
                    />
                );
            }
        }
    ]