'use client'

import { Circuito } from "@prisma/client";
import { DataTable } from "./data-table";
import { columns } from "./columns";

interface CircuitListProps {
  circuites: Circuito[];
  setCircuites: React.Dispatch<React.SetStateAction<Circuito[]>>;
}

export function CircuitList({ circuites, setCircuites }: CircuitListProps) {  
  return (
    <DataTable
      columns={columns(setCircuites)}
      data={circuites}
    />
  );
}