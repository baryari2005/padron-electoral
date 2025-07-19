"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { FormCreateOrUpdateElectoralRoll } from "../components/FormCreateOrUpdate";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowBigLeft, UserPen } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

// ✅ Tipo local con voto_sino validado como "SI" | "NO"
type VotoSino = "SI" | "NO";

interface ElectoralRoll {
  id: number;
  distrito: string;
  tipo_ejemplar: string;
  numero_matricula: string;
  apellido: string;
  nombre: string;
  clase: number;
  genero: string;
  domicilio: string;
  seccion: string;
  circuitoId: number;
  localidad: string;
  codigo_postal: string;
  tipo_nacionalidad: string;
  numero_mesa: number;
  orden_mesa: number;
  establecimientoId: number;
  voto_sino: VotoSino;
}

export default function EditElectoralRollPage() {
  const [electoralRoll, setElectoralRoll] = useState<ElectoralRoll | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchElectoralRoll = async () => {
      try {
        const res = await axiosInstance.get(`/api/electoral-rolls/${id}`);
        const data = res.data;

        const transformed: ElectoralRoll = {
          ...data,
          voto_sino: data.voto_sino === "SI" ? "SI" : "NO", // Garantizamos el tipo literal
        };

        setElectoralRoll(transformed);
      } catch (error: any) {
        toast.error("Error al cargar el registro");
        router.push("/electoral-rolls");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchElectoralRoll();
  }, [id, router]);

  if (loading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!electoralRoll) return null;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-secondary rounded-lg shadow-md">
      {/* Volver */}
      <div className="mb-6">
        <Link
          href="/electoral-rolls"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowBigLeft className="w-5 h-5 mr-1" />
          Volver
        </Link>
      </div>

      {/* Encabezado */}
      <div className="flex items-center mb-2 space-x-2">
        <UserPen className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Editar Elector</h2>
      </div>
      <p className="text-muted-foreground mb-6">Modificar un elector existente en el sistema</p>

      <Separator className="mb-6" />
      <FormCreateOrUpdateElectoralRoll
        padron={electoralRoll}
        onSuccess={() => router.push("/electoral-rolls")}
        onClose={() => router.push("/electoral-rolls")}        
      />
    </div>
  );
}
