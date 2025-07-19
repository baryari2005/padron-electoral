// ListCompanies.tsx
'use client'

import { Company } from "@prisma/client";
import { DataTable } from "./data-table";
import { columns } from "./columns";

interface ListCompaniesProps {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
}

export function ListCompanies({ companies, setCompanies }: ListCompaniesProps) {
  return (
    <DataTable
      columns={columns(setCompanies)}
      data={companies}
    />
  );
}

