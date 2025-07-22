'use client';

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { TableActions } from "@/components/ui/tableActions";
import { Role, User } from "@prisma/client";

export type UsuarioConRol = User & {
  role: Role | null;
};

interface ColumnsProps {
  onDeleted?: () => void;
}

export const columns = (
  { onDeleted }: ColumnsProps
): ColumnDef<UsuarioConRol>[] => [
    {
      accessorKey: "avatarUrl",
      header: "Avatar",
      cell: ({ row }) => {
        const imageUrl = row.original.avatarUrl;
        return imageUrl ? (
          <img
            src={imageUrl}
            alt="Avatar"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm text-muted-foreground italic">Sin imagen</span>
        );
      },
    },
    {
      accessorKey: "userId",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          ID
          <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nombre
          <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Apellido
          <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
    },
    {
      id: "rol",
      header: "Rol",
      cell: ({ row }) => {
        const rol = row.original.role;
        return (
          <span className="text-sm">
            {rol ? rol.name : <span className="italic text-muted-foreground">Sin rol</span>}
          </span>
        );
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
            editUrl={`/users/${id}`}
            deleteUrl={`/api/users/${id}`}
            resourceName="Usuario"
            confirmTitle="¿Eliminar este usuario?"
            confirmDescription="Esta acción eliminará permanentemente el usuario. ¿Continuar?"
            confirmActionLabel="Eliminar"
            onDeleted={() => onDeleted?.()}
          />
        );
      },
    },
  ];

