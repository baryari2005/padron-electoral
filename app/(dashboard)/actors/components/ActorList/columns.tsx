"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { sortableHeader } from "@/app/(dashboard)/components/table/SortableHeader";

export type VoterRow = {
  id: string;
  apellido: string | null;
  nombre: string | null;
  dni: string | number | null;
  numeroOrden: number | null;
  votedAt: string | null;
  votoSiNo: string | boolean | number | null;
  telefono: string | null;
  establecimientoNombre: string | null;
  numeroPlanilla: number | null;
  nombrePlanilla: string | null;
  referente: string | null;
  planillero: string | null;
  chofer: string | null;
};

interface ColumnsProps {
  onDeleted?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  hideReferente?: boolean;
}

function formatDate(date: string | null) {
  if (!date) return "-";

  return new Date(date).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function renderVoto(value: VoterRow["votoSiNo"]) {
  const normalized = String(value ?? "").toLowerCase();

  if (
    normalized === "si" ||
    normalized === "sí" ||
    normalized === "true" ||
    normalized === "1"
  ) {
    return <Badge>Votó</Badge>;
  }

  if (
    normalized === "no" ||
    normalized === "false" ||
    normalized === "0"
  ) {
    return <Badge variant="secondary">No votó</Badge>;
  }

  return <span>-</span>;
}

export function columns({
  onDeleted,
  canEdit,
  canDelete,
  hideReferente = false,
}: ColumnsProps): ColumnDef<VoterRow>[] {
  const cols: ColumnDef<VoterRow>[] = [
    {
      accessorKey: "apellido",
      header: sortableHeader("Apellido"),
      cell: ({ row }) => row.original.apellido ?? "-",
    },
    {
      accessorKey: "nombre",
      header: sortableHeader("Nombre"),
      cell: ({ row }) => row.original.nombre ?? "-",
    },
    {
      accessorKey: "dni",
      header: sortableHeader("DNI"),
      cell: ({ row }) => row.original.dni ?? "-",
    },
    {
      accessorKey: "numeroOrden",
      header: sortableHeader("Orden"),
      cell: ({ row }) => row.original.numeroOrden ?? "-",
    },
    {
      accessorKey: "establecimientoNombre",
      header: sortableHeader("Establecimiento"),
      cell: ({ row }) => row.original.establecimientoNombre ?? "-",
    },
    {
      accessorKey: "numeroPlanilla",
      header: sortableHeader("Planilla"),
      cell: ({ row }) => {
        const numero = row.original.numeroPlanilla;
        const nombre = row.original.nombrePlanilla;

        if (!numero && !nombre) return "-";

        return nombre ? `${numero ?? "-"} - ${nombre}` : (numero ?? "-");
      },
    },
    {
      accessorKey: "planillero",
      header: sortableHeader("Planillero"),
      cell: ({ row }) => row.original.planillero ?? "-",
    },
    {
      accessorKey: "chofer",
      header: sortableHeader("Chofer"),
      cell: ({ row }) => row.original.chofer ?? "-",
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ row }) => row.original.telefono ?? "-",
    },
    {
      accessorKey: "votoSiNo",
      header: sortableHeader("Estado"),
      cell: ({ row }) => renderVoto(row.original.votoSiNo),
    },
    {
      accessorKey: "votedAt",
      header: "Fecha voto",
      cell: ({ row }) => formatDate(row.original.votedAt),
    },
  ];

  if (!hideReferente) {
    cols.splice(6, 0, {
      accessorKey: "referente",
      header: "Referente",
      cell: ({ row }) => row.original.referente ?? "-",
    });
  }

  return cols;
}