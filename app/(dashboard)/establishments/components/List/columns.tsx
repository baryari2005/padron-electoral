'use client';

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Establecimiento, Circuito } from "@prisma/client";
import { TableActions } from "@/components/ui/tableActions";

// ✅ Tipo extendido con la relación circuito
export type EstablecimientoConCircuito = Establecimiento & {
  circuito: Circuito | null;
};

export const columns = (
  setEstablishments: React.Dispatch<React.SetStateAction<EstablecimientoConCircuito[]>>
): ColumnDef<EstablecimientoConCircuito>[] => [
  {
    accessorKey: "profileImage",
    header: "Logo",
    cell: ({ row }) => {
      const imageUrl = row.original.profileImage;
      return imageUrl ? (
        <img
          src={imageUrl}
          alt="Logo del establecimiento"
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <span className="text-sm text-muted-foreground italic">Sin imagen</span>
      );
    },
  },
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
  },
  {
    accessorKey: "direccion",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Dirección
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
  },
  {
    id: "circuito",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Circuito
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const circuito = row.original.circuito;
      return (
        <span className="text-sm">
          {circuito
            ? `${circuito.codigo} - ${circuito.nombre}`
            : <span className="italic text-muted-foreground">Sin circuito</span>}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <TableActions
          id={id.toString()}
          editUrl={`/establishments/${id}`}
          deleteUrl={`/api/establishments/${id}`}
          resourceName="Establecimiento"
          confirmTitle="¿Eliminar este Establecimiento?"
          confirmDescription="Esta acción eliminará permanentemente el Establecimiento. ¿Continuar?"
          confirmActionLabel="Eliminar"
          onDeleted={(deletedId) => {
            setEstablishments((prev) =>
              prev.filter((item) => item.id !== Number(deletedId))
            );
          }}
        />
      );
    },
  },
];
