'use client';

import { columns, EstablecimientoConCircuito } from "./columns";
import { DataTable } from "./data-table";

interface EstablishmentsListProps {
  establishments: EstablecimientoConCircuito[];
  setEstablishments: React.Dispatch<React.SetStateAction<EstablecimientoConCircuito[]>>;
}

export function EstablishmentsList({
  establishments,
  setEstablishments,
}: EstablishmentsListProps) {
  return (
    <DataTable<EstablecimientoConCircuito, unknown>
      columns={columns(setEstablishments)}
      data={establishments}
    />
  );
}
