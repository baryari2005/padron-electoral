"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";


interface FiscalesTableProps {
  fiscales: {
    agrupacionId: string;
    agrupacionNombre: string;
    firma: string;
    aclaracion: string;
    dni: string;
  }[];
  onDelete: (index: number) => void;
}

export function FiscalesTable({ fiscales, onDelete }: FiscalesTableProps) {
  return (
    <div className="rounded-md border">
      <DataTable
        columns={columns(onDelete)}
        data={fiscales}
        emptyMessage="No hay fiscales cargados."
      />
    </div>
  );
}