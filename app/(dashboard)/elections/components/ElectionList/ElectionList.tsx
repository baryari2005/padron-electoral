"use client";

import { GenericDataTable, GenericListWithTable } from "@/app/(dashboard)/components";
import { columns } from "./columns";

interface Props {
  search: string;
  onDeleted?: () => void;
  refresh?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function ElectionList({
  search,
  onDeleted,
  refresh,
  canEdit,
  canDelete,
}: Props) {
  return (
    <GenericListWithTable
      endpoint="/api/elections"
      columns={columns({ onDeleted, canEdit, canDelete })}
      externalSearch={search}
      refreshToken={refresh}
      pageSize={10}
      DataTableComponent={(props) => (
        <GenericDataTable
          {...props}
          searchPlaceholder="Filtrar por elección..."
        />
      )}
    />
  );
}