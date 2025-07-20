'use client';

import { columns, DataTable, UsuarioConRol } from "./";

interface UsersListProps {
  users: UsuarioConRol[];
  setUsers: React.Dispatch<React.SetStateAction<UsuarioConRol[]>>;
}

export function UsersList({
  users,
  setUsers,
}: UsersListProps) {
  return (
    <DataTable<UsuarioConRol, unknown>
      columns={columns(setUsers)}
      data={users}
    />
  );
}
