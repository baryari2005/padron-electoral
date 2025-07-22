"use client";

import { GenericListWithTable, GenericDataTable } from "@/app/(dashboard)/components";
import { columns } from "./columns";

interface Props {
  search: string;
  onDeleted?: () => void;
  refresh?: boolean;
}

export function PoliticalGroupList({ search, onDeleted, refresh }: Props) {
  return (
    <GenericListWithTable    
      endpoint="/api/political-groups"
      columns={columns({ onDeleted })}      
      externalSearch={search}
      refreshToken={refresh}
      pageSize={10}
      DataTableComponent={(props) => (
        <GenericDataTable
          {...props}
          searchPlaceholder="Filtrar por agrupación política..."
        />
      )}
    />
  );
}
