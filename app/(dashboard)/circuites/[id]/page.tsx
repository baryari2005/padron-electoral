"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axios";

import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";

import Link from "next/link";
import { ArrowBigLeft, MapPinned } from "lucide-react";
import { FormCircuit } from "../components/CircuitForm";
import { formatApiMessage } from "@/lib/utils/formatters";
import { Cargando } from "@/components/ui/upload";


export default function CircuitIdPage({ params }: { params: { id: number } }) {
  const searchParams = useSearchParams();
  const modo: "ver" | "editar" = searchParams.get("modo") === "ver" ? "ver" : "editar";

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

  if (loading) return <Cargando variant="page" label="Cargando circuito..."/>;
  if (!Circuit) return null;

  const handleUpdated = () => {
    toast.success(formatApiMessage("success.circuiteUpdated"));
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
        <h2 className="text-2xl font-semibold">
          {modo === "ver" ?
            "Ver Circuito" :
            "Editar Circuito"
          }
        </h2>
      </div>
      <p className="text-muted-foreground mb-6">
        {modo === "ver"
          ? "Visualizá los datos de un circuito registrado en el sistema."
          : "Modificar un Circuito existente en el sistema."
        }
      </p>

      <Separator className="mb-6" />

      {/* Formulario */}
      <FormCircuit
        circuit={Circuit}
        modo={modo}
        onSuccess={handleUpdated} />
    </div>
  );
}