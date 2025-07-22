"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";

import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";
import { ArrowBigLeft, Compass } from "lucide-react";
import Link from "next/link";
import { FormPoliticalGroup } from "../components";

export default function PoliticalGroupIdPage({ params }: { params: { id: number } }) {
  const router = useRouter();
  const [politicalGroup, setPoliticalGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchPoliticalGroup = async () => {
      const id = Number(params.id);
      if (isNaN(id)) return router.push("/");

      try {
        const res = await axiosInstance.get(`/api/political-groups/${id}`);
        if (res.status !== 200) return router.push("/");
        setPoliticalGroup(res.data);
      } catch (error) {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPoliticalGroup();
  }, [params.id, router]);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (!politicalGroup) return null;

  const handleUpdated = () => {
    toast.success("Agrupación Política actualizada correctamente");
    router.push("/political-groups");
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-secondary rounded-lg shadow-md">
      {/* Volver */}
      <div className="mb-6">
        <Link
          href="/political-groups"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowBigLeft className="w-5 h-5 mr-1" />
          Volver
        </Link>
      </div>

      {/* Encabezado */}
      <div className="flex items-center mb-2 space-x-2">
        <Compass className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Editar Agrupación Política</h2>
      </div>
      <p className="text-muted-foreground mb-6">Modificar una Agrupación Política existente en el sistema</p>

      <Separator className="mb-6" />

      <FormPoliticalGroup
        politicalGroup={politicalGroup}
        onSuccess={handleUpdated} />
    </div>
  );
}