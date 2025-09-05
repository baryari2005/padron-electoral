// src/features/users/hooks/useEscuelas.ts
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";

export type EscuelaLite = { id: number; nombre: string };

export function useEscuelas(shouldLoad: boolean) {
  const [escuelas, setEscuelas] = useState<EscuelaLite[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!shouldLoad) return;
    if (loaded && escuelas.length > 0) return;

    (async () => {
      try {
        const { data } = await axiosInstance.get("/api/establishments?all=true");
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        setEscuelas(items as EscuelaLite[]);
      } catch {
        setEscuelas([]);
      } finally {
        setLoaded(true);
      }
    })();
  }, [shouldLoad, loaded, escuelas.length]);

  return { escuelas, loaded, loading: !loaded};
}
