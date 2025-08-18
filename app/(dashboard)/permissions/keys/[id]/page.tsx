"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";

import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";

import Link from "next/link";
import { ArrowBigLeft, MapPinned, ShieldPlus } from "lucide-react";

import { formatApiMessage } from "@/lib/utils/formatters";
import { PermissionsKeyForm } from "../components/PermissionsKeyForm";
import { Cargando } from "@/components/ui/upload";


export default function PermissionKeyIdPage({ params }: { params: { id: number } }) {
  const router = useRouter();
  const [Permission, setPermission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchPermission = async () => {
      const id = Number(params.id);
      if (isNaN(id)) return router.push("/");

      try {
        const res = await axiosInstance.get(`/api/permissions/keys/${id}`);
        if (res.status !== 200) return router.push("/");
        setPermission(res.data);
      } catch (error) {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPermission();
  }, [params.id, router]);

  if (loading) return <Cargando label="Cargando..."/>;
  if (!Permission) return null;

  const handleUpdated = () => {
    toast.success(formatApiMessage("success.permissionsUpdated"));
    router.push("/permissions/keys");
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-secondary rounded-lg shadow-md">
      {/* Volver */}
      <div className="mb-6">
        <Link
          href="/permissions/keys"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowBigLeft className="w-5 h-5 mr-1" />
          Volver
        </Link>
      </div>

      {/* Encabezado */}
      <div className="flex items-center mb-2 space-x-2">
        <ShieldPlus className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Editar Permiso</h2>
      </div>
      <p className="text-muted-foreground mb-6">Modificar un Permiso existente en el sistema</p>

      <Separator className="mb-6" />

      {/* Formulario */}
      <PermissionsKeyForm permission={Permission} onSuccess={handleUpdated} />
    </div>
  );
}