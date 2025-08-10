"use client";

import { GenericListWithTable, GenericDataTable } from "@/app/(dashboard)/components";
import { columns } from "./columns";

interface Props {
  search: string;
  filters: {
    localidad?: string;
    circuitoId?: number;
    establecimientoId?: number;
  };
  onDeleted?: () => void;
  refresh?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function ElectoralRollList({ search, filters, onDeleted, refresh,  canEdit, canDelete }: Props) {
  return (
    <GenericListWithTable
      endpoint="/api/electoral-rolls"
      columns={columns({ onDeleted, canEdit, canDelete })}
      filters={filters}
      externalSearch={search}
      refreshToken={refresh}
      pageSize={10}
      DataTableComponent={(props) => (
        <GenericDataTable
          {...props}
          searchPlaceholder="Filtrar por apellido, nombre o matrícula del votante..."
        />
      )}
    />
  );
}
