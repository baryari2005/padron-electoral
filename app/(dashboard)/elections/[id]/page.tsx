"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { ArrowBigLeft, CalendarDays, Vote } from "lucide-react";
import Link from "next/link";
import { FormElection } from "../components";
import { formatApiMessage } from "@/lib/utils/formatters";
import { Cargando } from "@/components/ui/upload";

interface Election {
  id: number;
  nombre: string;
  tipo: "GENERAL" | "INTERNA";
  fecha?: Date | null;
  estado: string;
  activa: boolean;
}

export default function ElectionIdPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchElection = async () => {
      const id = Number(params.id);
      if (isNaN(id)) {
        router.push("/dashboard/elections");
        return;
      }

      try {
        const res = await axiosInstance.get(`/api/elections/${id}`);
        if (res.status !== 200) {
          router.push("/dashboard/elections");
          return;
        }

        const data = res.data;

        setElection({
          ...data,
          fecha: data.fecha ? new Date(data.fecha) : null,
        });
      } catch (error) {
        router.push("/dashboard/elections");
      } finally {
        setLoading(false);
      }
    };

    fetchElection();
  }, [params.id, router]);

  if (loading)
    return <Cargando variant="page" label="Cargando elección..." />;

  if (!election) return null;

  const handleUpdated = () => {
    toast.success(formatApiMessage("success.electionUpdated"));
    router.push("/elections");
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-secondary rounded-lg shadow-md">
      {/* Volver */}
      <div className="mb-6">
        <Link
          href="/elections"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowBigLeft className="w-5 h-5 mr-1" />
          Volver
        </Link>
      </div>

      {/* Encabezado */}
      <div className="flex items-center mb-2 space-x-2">
        <Vote className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Cambiar Estados de Elección</h2>
      </div>
      <p className="text-muted-foreground mb-6">
        Permite cambiar los estados de una elección existente en el sistema
      </p>

      <Separator className="mb-6" />

      {/* Formulario */}
      <FormElection election={election} onSuccess={handleUpdated} />
    </div>
  );
}