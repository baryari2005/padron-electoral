"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { FormCreateOrUpdateElectoralRoll } from "../components/FormCreateOrUpdate";
import { ArrowBigLeft, UserPen } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Cargando } from "@/components/ui/upload";
import { ElectoralRollFormValues } from "../lib";
import { useActiveElection } from "@/hooks/useActiveElection";
import { PadronElectoral } from "@prisma/client";
import { StatusPage } from "@/components/status/StatusPage";

export default function EditElectoralRollPage() {
  const [electoralRoll, setElectoralRoll] =
    useState<PadronElectoral | null>(null);

  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const modo: "ver" | "editar" =
    searchParams.get("modo") === "ver" ? "ver" : "editar";

  const { loading: loadingNea, hasActive, electionType } = useActiveElection();

  useEffect(() => {
    const fetchElectoralRoll = async () => {
      try {
        const res = await axiosInstance.get(`/api/electoral-rolls/${id}`);
        const data = res.data;

        const transformed: PadronElectoral = {
          ...data,
          votoSiNo: data.voto_sino === "S" ? "S" : "N",
        };

        setElectoralRoll(transformed);
      } catch {
        toast.error("Error al cargar el registro");
        router.push("/electoral-rolls");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchElectoralRoll();
  }, [id, router]);

  if (loadingNea) return null;

  if (!hasActive) {
    return (
      <StatusPage
        code="403"
        title="Acceso denegado."
        description="Para acceder a esta sección tiene que existir una elección activa."
        imageSrc="/robot-nea.png"
        primaryAction={{ label: "Ir al inicio", href: "/" }}
      />
    );
  }

  if (loading)
    return <Cargando variant="page" label="Cargando elector..." />;

  if (!electoralRoll) return null;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-secondary rounded-lg shadow-md">
      <div className="mb-6">
        <Link
          href="/electoral-rolls"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowBigLeft className="w-5 h-5 mr-1" />
          Volver
        </Link>
      </div>

      <div className="flex items-center mb-2 space-x-2">
        <UserPen className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">
          {modo === "ver" ? "Ver Elector" : "Editar Elector"}
        </h2>
      </div>

      <p className="text-muted-foreground mb-6">
        {modo === "ver"
          ? "Visualizá los datos de un elector registrado en el sistema."
          : "Modificar un elector existente en el sistema."}
      </p>

      <Separator className="mb-6" />

      <FormCreateOrUpdateElectoralRoll
        padron={electoralRoll}
        modo={modo}
        electionType={electionType}
        onSuccess={() => router.push("/electoral-rolls")}
        onClose={() => router.push("/electoral-rolls")}
      />
    </div>
  );
}