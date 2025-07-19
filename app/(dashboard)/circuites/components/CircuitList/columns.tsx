'use client'

import { Button } from "@/components/ui/button";
import { Circuito } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react";
import { TableActions } from "@/components/ui/tableActions";

export const columns = (
    setCircuites: React.Dispatch<React.SetStateAction<Circuito[]>>
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

                return (
                    <TableActions
                        id={id.toString()}
                        editUrl={`/circuites/${id}`}
                        deleteUrl={`/api/circuites/${id}`}
                        resourceName="Circuito"
                        confirmTitle="¿Eliminar este Circuito?"
                        confirmDescription="Esta acción eliminará permanentemente el Circuito. ¿Continuar?"
                        confirmActionLabel="Eliminar"
                        onDeleted={(deletedId) => {
                            setCircuites((prev) => prev.filter((item) => item.id !== Number(deletedId)));
                        }}
                    />
                );
            }
        }
    ]