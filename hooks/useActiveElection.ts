"use client";

import axiosInstance from "@/utils/axios";
import { useEffect, useState } from "react";

export interface ActiveElection {
  id: number;
  nombre: string;
  fecha: string | null;
  tipo: string;
  estado: string;
  activa: boolean;
}

export function useActiveElection() {
  const [loading, setLoading] = useState(true);
  const [election, setElection] = useState<ActiveElection | null>(null);

  useEffect(() => {
    let mounted = true;

    axiosInstance
      .get("/api/elections/active")
      .then((res) => {
        if (!mounted) return;

        if (res.data.active && res.data.election) {
          setElection(res.data.election);
        } else {
          setElection(null);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setElection(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const hasActive = !!election;

  return {
    loading,
    hasActive,
    election,
    electionId: election?.id,
    electionName: election?.nombre,
    electionType: election?.tipo,
    electionState: election?.estado,
    electionDate: election?.fecha,
  };
}