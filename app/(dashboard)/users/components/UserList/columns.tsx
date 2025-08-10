'use client';

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { TableActions } from "@/components/ui/tableActions";
import { Rol, Usuario } from "@prisma/client";
import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";

export type UsuarioConRol = Usuario & {
  rol: Rol | null;
};

interface ColumnsProps {
  onDeleted?: () => void;
}

export const columns = (
  { onDeleted }: ColumnsProps): ColumnDef<UsuarioConRol>[] => {
  const baseColumns: ColumnDef<UsuarioConRol>[] = [
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
      accessorKey: "nombre",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nombre
          <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
    },
    {
      accessorKey: "apellido",
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
        const rol = row.original.rol;
        return (
          <span className="text-sm">
            {rol ? rol.nombre : <span className="italic text-muted-foreground">Sin rol</span>}
          </span>
        );
      },
    },
    buildActionsColumn({ component: "users", label: "usuario", onDeleted }),
  ];

  return baseColumns;
}

