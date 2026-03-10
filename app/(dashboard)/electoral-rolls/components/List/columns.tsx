"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PadronElectoral } from "@prisma/client";
import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";
import { sortableHeader } from "@/app/(dashboard)/components/table/SortableHeader";

interface ElectoralRollWithRelations extends PadronElectoral {
  establecimiento: { nombre: string };
  circuito: { nombre: string, codigo: string };
  referente?: { nombre: string } | null;
  planillero?: { nombre: string } | null;
  chofer?: { nombre: string } | null;
  planilla?: { numero: string, nombre: string }
}

interface ColumnsProps {
  onDeleted?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  electionType?: string;
}
export const columns = ({
  onDeleted,
  canEdit,
  canDelete,
  electionType,
}: ColumnsProps): ColumnDef<ElectoralRollWithRelations>[] => {
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
      cell: ({ row }) =>
        row.original.establecimiento?.nombre || "-",
    },
    {
      header: "Circuito",
      cell: ({ row }) => {
        const circuito = row.original.circuito;
        return circuito
          ? `${circuito.codigo} - ${circuito.nombre}`
          : "-";
      },
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ row }) =>
        row.original.telefono || "-",
    },

  ];

  const internalColumns: ColumnDef<ElectoralRollWithRelations>[] =
    electionType === "INTERNA"
      ? [
        {
          accessorKey: "planillaId",
          header: "N° Planilla",
          cell: ({ row }) => {
            const planilla = row.original.planilla;
            return !planilla
              ? "-"
              : planilla.nombre?.trim()
                ? `${planilla.numero} - ${planilla.nombre}`
                : `${planilla.numero}`;
          },
        },
        {
          header: "Referente",
          cell: ({ row }) =>
            row.original.referente?.nombre || "-",
        },
        {
          header: "Planillero",
          cell: ({ row }) =>
            row.original.planillero?.nombre || "-",
        },
        {
          header: "Chofer",
          cell: ({ row }) =>
            row.original.chofer?.nombre || "-",
        },
      ]
      : [];

  return [
    ...baseColumns,
    ...internalColumns,
    buildActionsColumn({
      component: "electoral-rolls",
      label: "elector",
      onDeleted,
      canEdit,
      canDelete,
    }),
  ];
};
