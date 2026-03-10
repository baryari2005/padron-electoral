"use client";

import { GenericListWithTable, GenericDataTable } from "@/app/(dashboard)/components";
import { columns } from "./columns";
import { useActiveElection } from "@/hooks/useActiveElection";

interface Props {
  search: string;
  onDeleted?: () => void;
  refresh?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

function returnString(electionType: string, inPlural: boolean) {
  if (inPlural)
    return (electionType != "INTERNA") ? "Agrupaciones Políticas" : "Listas Políticas";
  else
    return (electionType != "INTERNA") ? "Agrupación Política" : "Lista Política";
}

export function PoliticalGroupList({ search, onDeleted, refresh, canEdit, canDelete }: Props) {
  const { electionType, electionId, loading } = useActiveElection();
  
  return (
    <GenericListWithTable
      endpoint="/api/political-groups"
      columns={columns({ onDeleted, canEdit, canDelete }, electionType ?? null)}
      externalSearch={search}
      refreshToken={refresh}
      pageSize={10}
      DataTableComponent={(props) => (
        <GenericDataTable
          {...props}
          searchPlaceholder={"Filtrar por " + returnString(electionType!, false) + "..."}
        />
      )}
    />
  );
}
