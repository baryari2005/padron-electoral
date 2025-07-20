"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { EstablishmentHeader } from "./components/Header";
import { EstablishmentsList } from "./components/List";
import { EstablecimientoConCircuito } from "./components/List/columns"; // ✅ IMPORTANTE
import { LoadingMessage } from "@/components/ui/loadingMessage";

export default function EstablishmentPage() {
  const [establishments, setEstablishments] = useState<EstablecimientoConCircuito[]>([]); // ✅ CORREGIDO
  const [circuites, setCircuites] = useState<{ id: number; nombre: string, codigo: string }[]>([]);
  const [loadingCircuites, setLoadingCircuites] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchEstablishments = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/establishments");
      setEstablishments(res.data.establishments); // ✅ res.data.establishments debe tener `circuito`
    }
    catch (err: any) {
      const msg = err?.response?.data?.error || "Algo salió mal.";
      toast.error(msg);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstablishments();
  }, []);

  useEffect(() => {
    const fetchCircuit = async () => {
      try {
        const res = await axiosInstance.get("/api/circuites");
        setCircuites(res.data.circuites);
      } catch (err: any) {
        toast.error("Error al obtener circuitos");
      } finally {
        setLoadingCircuites(false);
      }
    };

    fetchCircuit();
  }, []);

  return (
    <div>
      <EstablishmentHeader
        onEstablishmentCreated={fetchEstablishments}
        circuites={circuites}
        loadingCircuites={loadingCircuites}
      />
      {loading ? (
        <LoadingMessage text="Cargando establecimientos..." />
      ) : (
        <EstablishmentsList
          establishments={establishments}
          setEstablishments={setEstablishments}
        />
      )}
    </div>
  );
}
