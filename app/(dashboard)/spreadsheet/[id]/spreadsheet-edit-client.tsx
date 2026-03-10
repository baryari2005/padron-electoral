"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowBigLeft, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

import axiosInstance from "@/utils/axios";
import { Separator } from "@/components/ui/separator";
import { Cargando } from "@/components/ui/upload";
import { StatusPage } from "@/components/status/StatusPage";

import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";

import { FormSpreadsheet } from "../components/spreadsheetForm";
import { useActiveElection } from "@/hooks/useActiveElection";

type Props = { id: string };

export default function SpreadsheetEditClient({ id }: Props) {
  const searchParams = useSearchParams();
  const modo: "ver" | "editar" = searchParams.get("modo") === "ver" ? "ver" : "editar";

  const router = useRouter();
  const { loading: loadingElection, hasActive } = useActiveElection();

  const canView = useHasPermission("ver_planillas");
  const canEdit = useHasPermission("editar_planillas");

  const [spreadsheet, setSpreadsheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpreadsheet = async () => {
      const numericId = Number(id);
      if (!Number.isFinite(numericId)) {
        router.replace("/spreadsheet");
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get(`/api/spreadsheet/${numericId}`);
        setSpreadsheet(res.data);
      } catch (err: any) {
        const msg = err?.response?.data?.error ?? "No se pudo cargar la planilla.";
        toast.error(msg);
        router.push("/spreadsheet");
      } finally {
        setLoading(false);
      }
    };

    fetchSpreadsheet();
  }, [id, router]);

  if (loadingElection) return null;

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

  if (!canView) return <AccessDeniedPage subtitle="Ver Planillas." />;
  if (modo === "editar" && !canEdit) return <AccessDeniedPage subtitle="Editar Planillas." />;

  if (loading) return <Cargando variant="page" label="Cargando planilla..." />;
  if (!spreadsheet) return null;

  const handleUpdated = () => {
    toast.success("Planilla actualizada");
    router.push("/spreadsheet");
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-secondary rounded-lg shadow-md">
      <div className="mb-6">
        <Link
          href="/spreadsheet"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowBigLeft className="w-5 h-5 mr-1" />
          Volver
        </Link>
      </div>

      <div className="flex items-center mb-2 space-x-2">
        <FileSpreadsheet className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">
          {modo === "ver" ? "Ver Planilla" : "Editar Planilla"}
        </h2>
      </div>

      <p className="text-muted-foreground mb-6">
        {modo === "ver"
          ? "Visualizá los datos de una planilla registrada en el sistema."
          : "Modificar una planilla existente en el sistema."}
      </p>

      <Separator className="mb-6" />

      <FormSpreadsheet spreadsheet={spreadsheet} modo={modo} onSuccess={handleUpdated} />
    </div>
  );
}
