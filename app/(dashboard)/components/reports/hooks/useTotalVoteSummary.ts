"use client";

import { useEffect, useState, useCallback } from "react";
import axiosInstance from "@/utils/axios";

export type Resultado = {
  categoria: string;
  agrupacion: string;
  votos: number;
  logo?: string | null;
};

type ApiResponse = { resultados: Resultado[] };

export function useTotalVoteSummary() {
  const [data, setData] = useState<Resultado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get<ApiResponse>("/api/reports/total-vote-summary");
      setData(res?.data?.resultados ?? []);
    } catch (e) {
      console.error("[useTotalVoteSummary] error:", e);
      setError("No se pudo cargar el resumen de votos");
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      await load();
    })();
    return () => {
      mounted = false;
    };
  }, [load]);

  return { data, loading, error, reload: load };
}
