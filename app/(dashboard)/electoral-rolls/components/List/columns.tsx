"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PadronElectoral } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";
import { sortableHeader } from "@/app/(dashboard)/components/table/SortableHeader";

interface ElectoralRollWithRelations extends PadronElectoral {
  establecimiento: { nombre: string };
  circuito: { nombre: string, codigo: string };
}

interface ColumnsProps {
  onDeleted?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}
export const columns = ({
  onDeleted,
  canEdit,
  canDelete }: ColumnsProps): ColumnDef<ElectoralRollWithRelations>[] => {
  const baseColumns: ColumnDef<ElectoralRollWithRelations>[] = [
    {
      accessorKey: "numeroMatricula",
      header: sortableHeader("Matrícula"),
    },
    {
      accessorKey: "apellido",
      header: sortableHeader("Apellido"),
    },
    {
      accessorKey: "nombre",
      header: sortableHeader("Nombre"),
    },
    {
      header: "Establecimiento",
      cell: ({ row }) => row.original.establecimiento?.nombre || "-",
    },
    {
      header: "Circuito",
      cell: ({ row }) => {
        const circuito = row.original.circuito;
        return circuito ? `${circuito.codigo} - ${circuito.nombre}` : "-";
      }
    },
    buildActionsColumn({ component: "electoral-rolls", label: "elector", onDeleted, canEdit, canDelete }),
  ];

  return baseColumns;
};
