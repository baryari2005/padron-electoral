"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PadronElectoral } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";

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
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}>
          Matrícula <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "apellido",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}>
          Apellido <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "nombre",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}>
          Nombre <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
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
