import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Trash2 } from "lucide-react";

export const columns = (
  onDelete: (index: number) => void
): ColumnDef<{
  agrupacionNombre: string;
  firma: string;
  aclaracion: string;
  dni: string;
}>[] => [
    {
      accessorKey: "agrupacionNombre",
      header: ({ column }) => (
        <Button
          type="button"
          variant="ghost"
          className="uppercase"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Agrupación
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "firma",
      header: "Firma",
    },
    {
      accessorKey: "aclaracion",
      header: ({ column }) => (
        <Button
          type="button"
          variant="ghost"
          className="uppercase"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Aclaracion
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "dni",
      header: "DNI",
    },
    {
      id: "actions",
      header: "ACCIONES",
      cell: ({ row }) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(row.index)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Eliminar
        </Button>
      ),
    },
  ];