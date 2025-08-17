"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { formatApiMessage } from "@/lib/utils/formatters";
import { AgrupacionPolitica } from "@prisma/client";

export function useAgrupaciones() {
  const [agrupaciones, setAgrupaciones] = useState<AgrupacionPolitica[]>([]);
  const [loadingAgrupaciones, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get("/api/political-groups?all=true");
        setAgrupaciones(data?.items ?? []);
      } catch (e) {
        console.error("❌ Error al cargar agrupaciones", e);
        toast.error(formatApiMessage("errors.politicalGroupBadRequest"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { agrupaciones, loadingAgrupaciones };
}
