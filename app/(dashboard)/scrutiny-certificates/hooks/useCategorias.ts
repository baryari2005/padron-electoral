"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { formatApiMessage } from "@/lib/utils/formatters";

export type Categoria = { id: string; nombre: string };

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get("/api/categories?all=true");
        setCategorias(data?.items ?? []);
      } catch (e) {
        console.error("❌ Error al cargar categorías", e);
        toast.error(formatApiMessage("errors.categoryBadRequest"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { categorias, loadingCategorias };
}
