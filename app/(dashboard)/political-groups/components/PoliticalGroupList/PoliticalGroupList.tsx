'use client'

import { AgrupacionPolitica } from "@prisma/client";
import { DataTable } from "./data-table";
import { columns } from "./columns";

interface PoliticalGroupListProps {
  politicalGroups: AgrupacionPolitica[];
  setPoliticalGroups: React.Dispatch<React.SetStateAction<AgrupacionPolitica[]>>;
}

export function PoliticalGroupList({ politicalGroups, setPoliticalGroups }: PoliticalGroupListProps) {  
  return (
    <DataTable
      columns={columns(setPoliticalGroups)}
      data={politicalGroups}
    />
  );
}