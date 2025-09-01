'use client';

import { ColumnDef } from "@tanstack/react-table";
import { Rol, Usuario } from "@prisma/client";
import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";
import { AvatarLogo } from "@/app/(dashboard)/components/common/AvatarLogo";
import { sortableHeader } from "@/app/(dashboard)/components/table/SortableHeader";

export type UsuarioConRolYEscuelas = Usuario & {
  rol: Rol | null;
  // Puede venir con nombres (ideal) o solo ids
  escuelas?: { establecimientoId: number; establecimiento?: { nombre: string } }[];
  escuelasIds?: number[];
};

interface ColumnsProps {
  onDeleted?: () => void;
}

export const columns = (
  { onDeleted }: ColumnsProps): ColumnDef<UsuarioConRolYEscuelas>[] => {
  const baseColumns: ColumnDef<UsuarioConRolYEscuelas>[] = [
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
    {
      id: "escuela",
      header: "Escuela",
      cell: ({ row }) => {
        const escs = row.original.escuelas ?? [];
        const firstName = escs[0]?.establecimiento?.nombre;
        const count = escs.length;

        if (firstName) {
          return (
            <span className="text-sm">
              {firstName}{count > 1 ? ` (+${count - 1})` : ""}
            </span>
          );
        }

        // fallback si no trajiste nombres, solo ids
        const ids = row.original.escuelasIds ?? escs.map(e => e.establecimientoId);
        if (ids.length > 0) {
          return <span className="text-sm">#{ids[0]}{ids.length > 1 ? ` (+${ids.length - 1})` : ""}</span>;
        }

        return <span className="italic text-muted-foreground text-sm">Sin escuela</span>;
      },
    },
    buildActionsColumn({ component: "users", label: "usuario", onDeleted }),
  ];

  return baseColumns;
}

