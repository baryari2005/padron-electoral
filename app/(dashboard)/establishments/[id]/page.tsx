"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";

import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";
import { ArrowBigLeft, Landmark, UserPen } from "lucide-react";
import Link from "next/link";
import { FormEstablishment } from "../components/FormCreateOrUpdate";


export default function EstablishmentIdPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [establishment, setEstablishment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [circuites, setCircuites] = useState<{ id: number; nombre: string, codigo: string }[]>([]);
  const [loadingCircuites, setLoadingCircuites] = useState(true);

  useEffect(() => {    
    const token = localStorage.getItem("token");
    
    if (!token) {
      router.push("/");
      return;
    }

    const fetchData = async () => {      
      const id = Number(params.id);

      if (isNaN(id)) return router.push("/");
      try {
        // Obtener usuario
        const res = await axiosInstance.get(`/api/establishments/${id}`);
        if (res.status !== 200) return router.push("/");

        setEstablishment(res.data);

          // Obtener circuitos
        const resCircuites = await axiosInstance.get("/api/circuites");
        setCircuites(resCircuites.data.circuites || []);

      } catch (error) {
        router.push("/");
      } finally {
        setLoading(false);
        setLoadingCircuites(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (!establishment) return null;

  const handleUpdated = () => {
    toast.success("Establecimiento actualizado correctamente");
    router.push("/establishments");
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-secondary rounded-lg shadow-md">
      {/* Volver */}
      <div className="mb-6">
        <Link
          href="/establishments"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowBigLeft className="w-5 h-5 mr-1" />
          Volver
        </Link>
      </div>

      {/* Encabezado */}
      <div className="flex items-center mb-2 space-x-2">
        <Landmark className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Editar Establecimiento</h2>
      </div>
      <p className="text-muted-foreground mb-6">Modificar un establecimiento existente en el sistema</p>

      <Separator className="mb-6" />

      {/* Formulario */}
      <FormEstablishment
        establishment={establishment}
        onSuccess={handleUpdated}
        circuites={circuites}
        loadingCircuites={loadingCircuites}
      />
    </div>
  );
}