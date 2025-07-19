"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PadronElectoral } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { TableActions } from "@/components/ui/tableActions";

interface ElectoralRollWithRelations extends PadronElectoral {
  establecimiento: { nombre: string };
  circuito: { nombre: string };
}

interface ColumnsProps {
  onDeleted?: () => void;
}
export const columns = ({ onDeleted }: ColumnsProps): ColumnDef<ElectoralRollWithRelations>[] => [
  {
    accessorKey: "numero_matricula",
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
    accessorKey: "establecimiento.nombre",
    header: "Establecimiento",
    cell: ({ row }) => row.original.establecimiento?.nombre || "-",
  },
  // {
  //   accessorKey: "circuito.nombre",
  //   header: "Circuito",
  //   cell: ({ row }) => row.original.circuito?.nombre || "-",
  // },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <TableActions
          id={id.toString()}
          editUrl={`/electoral-rolls/${id}`}
          deleteUrl={`/api/electoral-rolls/${id}`}
          resourceName="Electores"
          confirmTitle="¿Eliminar este Elector?"
          confirmDescription="Esta acción eliminará permanentemente el Elector. ¿Continuar?"
          confirmActionLabel="Eliminar"
          onDeleted={() => onDeleted?.()}
        />
      );
    },
  },
];
