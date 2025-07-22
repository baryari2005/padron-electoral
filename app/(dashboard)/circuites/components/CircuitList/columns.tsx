'use client'

import { Button } from "@/components/ui/button";
import { Circuito } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react";
import { TableActions } from "@/components/ui/tableActions";

interface ColumnsProps {
    onDeleted?: () => void;
}

export const columns = (
    { onDeleted }: ColumnsProps
): ColumnDef<Circuito>[] => [
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
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => {
                const { id } = row.original;
                const component = "circuites";

                return (
                    <TableActions
                        id={id.toString()}
                        editUrl={`/${component}/${id}`}
                        deleteUrl={`/api/${component}/${id}`}
                        resourceName="Circuito"
                        confirmTitle="¿Eliminar este circuito?"
                        confirmDescription="Esta acción eliminará permanentemente el circuito. ¿Continuar?"
                        confirmActionLabel="Eliminar"
                        onDeleted={() => onDeleted?.()}
                    />
                );
            }
        }
    ]