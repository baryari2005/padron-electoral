"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { UserHeader } from "./components/Header";
import { UsuarioConRol } from "./components/List/columns";
import { UsersList } from "./components/List";
import { LoadingMessage } from "@/components/ui/loadingMessage";

export default function UserPage() {
  const [users, setUsers] = useState<UsuarioConRol[]>([]);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchUsers = async () => {
     setLoadingUsers(true);
    try {
      const res = await axiosInstance.get("/api/users");
      setUsers(res.data.users);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Algo salió mal.";
      toast.error(msg);
    }
    finally {
      setLoadingUsers(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axiosInstance.get("/api/roles");
      setRoles(res.data.roles);
    } catch (err) {
      toast.error("Error al obtener roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  return (
    <div>
      <UserHeader
        onUserCreated={fetchUsers}
        roles={roles}
        loadingRoles={loadingRoles}
      />
      {loadingUsers ? (
        <LoadingMessage text="Cargando usuarios..." />
      ) : (
        <UsersList users={users} setUsers={setUsers} />
      )}
    </div>
  );
}
