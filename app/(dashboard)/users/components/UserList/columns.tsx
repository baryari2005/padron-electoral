'use client';

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { TableActions } from "@/components/ui/tableActions";
import { Rol, Usuario } from "@prisma/client";
import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";
import Image from "next/image";
import { AvatarLogo } from "@/app/(dashboard)/components/common/AvatarLogo";
import { sortableHeader } from "@/app/(dashboard)/components/table/SortableHeader";

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
        const imageUrl: string | null = row.original.avatarUrl ?? null;
        return (
          <AvatarLogo
            src={imageUrl}
            alt={`Logo de ${row.original?.nombre}`}
            size={40}
          />
        );
      },
    },
    {
      accessorKey: "userId",
      header: sortableHeader("ID"),
    },
    {
      accessorKey: "nombre",
      header: sortableHeader("Nombre"),
    },
    {
      accessorKey: "apellido",
      header: sortableHeader("Apellido"),
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

