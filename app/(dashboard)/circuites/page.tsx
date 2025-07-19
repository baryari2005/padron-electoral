"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { Circuito } from "@prisma/client";
import { CircuitHeader } from "./components/CircuitHeader";
import { CircuitList } from "./components/CircuitList";


export default function CircuitsPage() {
  const [data, setData] = useState<Circuito[]>([]);

  const fetchCircuites = async () => {
    try{
      const res = await axiosInstance.get("/api/circuites");    
      setData(res.data.circuites);
    }
    catch(err)
    {
      toast.error("Algo salió mal.")
    }
  }
  
  useEffect(() => {
    fetchCircuites();
  }, []);

  return (
    <div>
      <CircuitHeader onCircuitCreated={fetchCircuites} />
      <CircuitList circuites={data} setCircuites={setData} /> 
    </div>
  )
}
