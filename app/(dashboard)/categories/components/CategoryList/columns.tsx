'use client'

import { Button } from "@/components/ui/button";
import { Categoria} from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react";
import { TableActions } from "@/components/ui/tableActions";

export const columns = (
    setCatagories: React.Dispatch<React.SetStateAction<Categoria[]>>
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

                return (
                    <TableActions
                        id={id.toString()}
                        editUrl={`/categories/${id}`}
                        deleteUrl={`/api/categories/${id}`}
                        resourceName="Categoria"
                        confirmTitle="¿Eliminar esta Categoria?"
                        confirmDescription="Esta acción eliminará permanentemente la Categoria. ¿Continuar?"
                        confirmActionLabel="Eliminar"
                        onDeleted={(deletedId) => {
                            setCatagories((prev) => prev.filter((item) => item.id !== Number(deletedId)));
                        }}
                    />
                );
            }
        }
    ]