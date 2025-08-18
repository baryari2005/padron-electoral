"use client";

import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";

export type Categoria = { id: number; nombre: string; orden?: number | null };

export function useCategorias() {
  const [data, setData] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await axiosInstance.get("/api/political-position"); // <-- asegurate que devuelva {id,nombre,orden}
      setData(res?.data ?? []);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar las categorías");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}
