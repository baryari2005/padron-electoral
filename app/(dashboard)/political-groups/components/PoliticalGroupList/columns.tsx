'use client'

import { Button } from "@/components/ui/button";

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react";
import { TableActions } from "@/components/ui/tableActions";
import { AgrupacionPolitica } from "@prisma/client";

export const columns = (
    setPoliticalGroups: React.Dispatch<React.SetStateAction<AgrupacionPolitica[]>>
): ColumnDef<AgrupacionPolitica>[] => [
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
                        confirmTitle="¿Eliminar esta Agrupación Política?"
                        confirmDescription="Esta acción eliminará permanentemente la Agrupación Política. ¿Continuar?"
                        confirmActionLabel="Eliminar"
                        onDeleted={(deletedId) => {
                            setPoliticalGroups((prev) => prev.filter((item) => item.id !== Number(deletedId)));
                        }}
                    />
                );
            }
        }
    ]