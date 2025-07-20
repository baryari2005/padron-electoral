"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { AgrupacionPolitica } from "@prisma/client";
import { PoliticalGroupHeader, PoliticalGroupList } from "./components";
import { LoadingMessage } from "@/components/ui/loadingMessage";


export default function PoliticalGroupPage() {
  const [data, setData] = useState<AgrupacionPolitica[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPoliticalGroups = async () => {
    try {
      const res = await axiosInstance.get("/api/political-groups");
      setData(res.data.politicalGroups);
    }
    catch (err) {
      toast.error("Algo salió mal.")
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPoliticalGroups();
  }, []);

  return (
    <div>
      <PoliticalGroupHeader onPoliticalGroupCreated={fetchPoliticalGroups} />

      {loading ? (
        <LoadingMessage text="Cargando agrupaciones políticas..." />
      ) : (
        <PoliticalGroupList politicalGroups={data} setPoliticalGroups={setData} />
      )}
    </div>
  )
}
