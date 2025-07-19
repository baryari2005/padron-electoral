"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";

import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";

import Link from "next/link";
import { ArrowBigLeft, MapPinned } from "lucide-react";
import { FormCircuit } from "../components/CircuitForm";


export default function CircuitIdPage({ params }: { params: { id: number } }) {
  const router = useRouter();
  const [Circuit, setCircuit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchCircuit = async () => {
      const id = Number(params.id);
      if (isNaN(id)) return router.push("/");

      try {
        const res = await axiosInstance.get(`/api/circuites/${id}`);
        if (res.status !== 200) return router.push("/");
        setCircuit(res.data);
      } catch (error) {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchCircuit();
  }, [params.id, router]);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (!Circuit) return null;

  const handleUpdated = () => {
    toast.success("Categoria actualizada correctamente");
    router.push("/circuites");
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-secondary rounded-lg shadow-md">
      {/* Volver */}
      <div className="mb-6">
        <Link
          href="/circuites"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowBigLeft className="w-5 h-5 mr-1" />
          Volver
        </Link>
      </div>

      {/* Encabezado */}
      <div className="flex items-center mb-2 space-x-2">
        <MapPinned className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Editar Circuito</h2>
      </div>
      <p className="text-muted-foreground mb-6">Modificar un Circuito existente en el sistema</p>

      <Separator className="mb-6" />

      {/* Formulario */}
      <FormCircuit circuit={Circuit} onSuccess={handleUpdated} />
    </div>
  );
}