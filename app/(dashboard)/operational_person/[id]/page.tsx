"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";

import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";
import { ArrowBigLeft, BookUser } from "lucide-react";
import Link from "next/link";

import { formatApiMessage } from "@/lib/utils/formatters";
import { Cargando } from "@/components/ui/upload";
import { FormOperationalPerson } from "../components";

export default function OperationalPersonIdPage({ params }: { params: { id: number } }) {
  const router = useRouter();
  const [operationalPerson, setOperationalPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetch = async () => {
      const id = Number(params.id);
      if (isNaN(id)) return router.push("/");

      try {
        const res = await axiosInstance.get(`/api/operational_person/${id}`);
        if (res.status !== 200) return router.push("/");
        setOperationalPerson(res.data);
      } catch (error) {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [params.id, router]);

  if (loading) return <Cargando variant="page" label="Cargando actor político..."/>;
  if (!operationalPerson) return null;

  const handleUpdated = () => {
    toast.success(formatApiMessage("success.operational_personUpdated"));
    router.push("/operational_person");
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-secondary rounded-lg shadow-md">
      {/* Volver */}
      <div className="mb-6">
        <Link
          href="/operational_person"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowBigLeft className="w-5 h-5 mr-1" />
          Volver
        </Link>
      </div>

      {/* Encabezado */}
      <div className="flex items-center mb-2 space-x-2">
        <BookUser className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Editar Actor Político</h2>
      </div>
      <p className="text-muted-foreground mb-6">Modificar un Actor Político existente en el sistema</p>

      <Separator className="mb-6" />

      {/* Formulario */}
      <FormOperationalPerson operationalPerson={operationalPerson} onSuccess={handleUpdated} />
    </div>
  );
}