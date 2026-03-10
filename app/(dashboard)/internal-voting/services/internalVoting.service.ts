import axiosInstance from "@/utils/axios";
import { GroupSummary, InternalVoter, Mesa, EstablishmentOption, PersonOption } from "../components/types";

export async function getEstablishments(): Promise<EstablishmentOption[]> {
  const { data } = await axiosInstance.get("/api/establishments?all=true");
  return data.items ?? data ?? [];
}

export async function getFilterOptions(
  referenteId?: string
): Promise<{ referentes: PersonOption[]; planilleros: PersonOption[] }> {
  const { data } = await axiosInstance.get("/api/internal-voting/filter-options", {
    params: {
      referenteId: referenteId || undefined,
    },
  });

  return {
    referentes: data.referentes ?? [],
    planilleros: data.planilleros ?? [],
  };
}

export async function getMesasByEstablecimiento(
  establecimientoId: string
): Promise<Mesa[]> {
  const { data } = await axiosInstance.get(
    `/api/electoral-rolls/mesas?establecimientoId=${establecimientoId}`
  );

  return data.items ?? data ?? [];
}

export async function getInternalVotingSummary(params: {
  establecimientoId?: string;
  mesaId?: string;
  referenteId?: string;
  planilleroId?: string;
  groupBy?: string;
  q?: string;
}): Promise<GroupSummary[]> {
  const { data } = await axiosInstance.get("/api/internal-voting/summary", {
    params,
  });

  return Array.isArray(data) ? data : data.items ?? [];
}

export async function getInternalVotingVoters(params: {
  establecimientoId?: string;
  mesaId?: string;
  referenteId?: string;
  planilleroId?: string;
  groupBy?: string;
  groupValue?: string;
  q?: string;
}): Promise<InternalVoter[]> {
  const { data } = await axiosInstance.get("/api/internal-voting/voters", {
    params,
  });

  return Array.isArray(data) ? data : data.items ?? [];
}

export async function saveInternalVotingBatch(payload: {
  mesaId: string | null;
  changes: { electorId: string; voted: boolean }[];
}) {
  return axiosInstance.post("/api/internal-voting/batch", payload);
}