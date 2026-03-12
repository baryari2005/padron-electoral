"use client";

import { useMemo } from "react";
import { GenericDataTable, GenericListWithTable } from "@/app/(dashboard)/components";
import { columns } from "./columns";

interface Props {
  referenteId: string;
  search: string;
  onDeleted?: () => void;
  refresh?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function ActorList({
  referenteId,
  search,
  onDeleted,
  refresh,
  canEdit,
  canDelete,
}: Props) {
  const endpoint = useMemo(() => {
    const params = new URLSearchParams();

    if (referenteId) {
      params.set("referenteId", referenteId);
    }

    return `/api/internal-voting/voters/paginated?${params.toString()}`;
  }, [referenteId]);

  return (
    <GenericListWithTable
      endpoint={endpoint}
      columns={columns({
        onDeleted,
        canEdit,
        canDelete,
        hideReferente: true,
      })}
      externalSearch={search}
      refreshToken={refresh}
      pageSize={20}
      DataTableComponent={(props) => (
        <GenericDataTable
          {...props}
          searchPlaceholder="Filtrar por nombre, apellido o DNI..."
        />
      )}
    />
  );
}