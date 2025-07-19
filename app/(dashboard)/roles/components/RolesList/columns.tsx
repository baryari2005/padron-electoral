'use client'

import { Button } from "@/components/ui/button";
import { Role } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react";
import { TableActions } from "@/components/ui/tableActions";

export const columns = (
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>
): ColumnDef<Role>[] => [
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
                        confirmTitle="¿Eliminar este Rol?"
                        confirmDescription="Esta acción eliminará permanentemente el Rol. ¿Continuar?"
                        confirmActionLabel="Eliminar"
                        onDeleted={(deletedId) => {
                            setRoles((prev) => prev.filter((item) => item.id !== Number(deletedId)));
                        }}
                    />
                );
            }
        }
    ]