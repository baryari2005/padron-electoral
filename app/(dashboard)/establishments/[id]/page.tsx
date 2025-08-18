"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axios";

import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";
import { ArrowBigLeft, School } from "lucide-react";
import Link from "next/link";
import { FormEstablishment } from "../components/EstablishmentForm";
import { formatApiMessage } from "@/lib/utils/formatters";
import { Cargando } from "@/components/ui/upload";


export default function EstablishmentIdPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const modo: "ver" | "editar" = searchParams.get("modo") === "ver" ? "ver" : "editar";

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

  if (loading) return <Cargando variant="page" label="Cargando establecimiento..."/>;
  if (!establishment) return null;

  const handleUpdated = () => {
    toast.success(formatApiMessage("success.establishmentUpdated"));
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
        <School className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">
          {modo === "ver" ?
            "Ver Establecimiento" :
            "Editar Establecimiento"}
        </h2>
      </div>
      <p className="text-muted-foreground mb-6">
        {modo === "ver"
          ? "Visualizá los datos de un establecimiento registrado en el sistema."
          : "Modificar un establecimiento existente en el sistema."}
      </p>

      <Separator className="mb-6" />

      {/* Formulario */}
      <FormEstablishment
        establishment={establishment}
        modo={modo}
        onSuccess={handleUpdated}
      />
    </div>
  );
}