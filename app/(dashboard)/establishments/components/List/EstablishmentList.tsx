'use client';

import { GenericDataTable, GenericListWithTable } from "@/app/(dashboard)/components";
import { columns} from "./columns";

interface Props {
  search: string;
  onDeleted?: () => void;
  refresh?: boolean;
}
export function EstablishmentsList({ search, onDeleted, refresh }: Props) {
return (
    <GenericListWithTable    
      endpoint="/api/establishments"
      columns={columns({ onDeleted })}      
      externalSearch={search}
      refreshToken={refresh}
      pageSize={10}
      DataTableComponent={(props) => (
        <GenericDataTable
          {...props}
          searchPlaceholder="Filtrar por nombre del establecimiento..."
        />
      )}
    />
  );
}
