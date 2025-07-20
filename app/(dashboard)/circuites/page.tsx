"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { Circuito } from "@prisma/client";
import { CircuitHeader } from "./components/CircuitHeader";
import { CircuitList } from "./components/CircuitList";
import { LoadingMessage } from "@/components/ui/loadingMessage";


export default function CircuitsPage() {
  const [data, setData] = useState<Circuito[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCircuites = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/circuites");
      setData(res.data.circuites);
    }
    catch (err) {
      toast.error("Algo salió mal.")
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCircuites();
  }, []);

  return (
    <div>
      <CircuitHeader onCircuitCreated={fetchCircuites} />
      {loading ? (
        <LoadingMessage text="Cargando circuitos..." />
      ) : (
        <CircuitList circuites={data} setCircuites={setData} />
      )}

    </div>
  )
}
