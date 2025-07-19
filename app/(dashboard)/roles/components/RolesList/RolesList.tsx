'use client'

import { Role } from "@prisma/client";
import { DataTable } from "./data-table";
import { columns } from "./columns";

interface RolesListProps {
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

export function RolesList({ roles, setRoles }: RolesListProps) {
  console.log(roles);
  return (
    <DataTable
      columns={columns(setRoles)}
      data={roles}
    />
  );
}