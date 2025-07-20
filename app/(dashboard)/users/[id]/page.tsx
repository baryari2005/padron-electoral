"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";

import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";

import Link from "next/link";
import { ArrowBigLeft, UserPen } from "lucide-react";
import { FormUser } from "../components/FormCreateOrUpdate";



export default function UserIdPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {    
    const token = localStorage.getItem("token");
    
    if (!token) {
      router.push("/");
      return;
    }

    const fetchData = async () => {      
      const id = params.id;
      
      try {
        // Obtener usuario
        const res = await axiosInstance.get(`/api/users/${id}`);
        if (res.status !== 200) return router.push("/");

        setUser(res.data);

          // Obtener circuitos
        const resRoles = await axiosInstance.get("/api/roles");
        setRoles(resRoles.data.roles || []);

      } catch (error) {
        router.push("/");
      } finally {
        setLoading(false);
        setLoadingRoles(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (!user) return null;

  const handleUpdated = () => {
    toast.success("Usuario actualizado correctamente");
    router.push("/users");
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-secondary rounded-lg shadow-md">
      {/* Volver */}
      <div className="mb-6">
        <Link
          href="/Users"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowBigLeft className="w-5 h-5 mr-1" />
          Volver
        </Link>
      </div>

      {/* Encabezado */}
      <div className="flex items-center mb-2 space-x-2">
        <UserPen className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Editar Usuario</h2>
      </div>
      <p className="text-muted-foreground mb-6">Modificar un usuario existente en el sistema</p>

      <Separator className="mb-6" />

      {/* Formulario */}
      <FormUser
        user={user}
        onSuccess={handleUpdated}
        roles={roles}
        loadingRoles={loadingRoles}
      />
    </div>
  );
}