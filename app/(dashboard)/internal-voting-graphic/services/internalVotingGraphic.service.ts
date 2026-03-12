import axiosInstance from "@/utils/axios";

type FilterOptionsParams = {
  referenteId?: string;
  planilleroId?: string;
};

type VotersParams = {
  referenteId?: string;
  planilleroId?: string;
  planillaId?: string;
  q?: string;
};

export async function getGraphicFilterOptions(params?: FilterOptionsParams) {
  const { data } = await axiosInstance.get("/api/internal-voting/graphic-filter-options", {
    params,
  });
  return data;
}

export async function getInternalVotingGraphicVoters(params?: VotersParams) {
  const { data } = await axiosInstance.get("/api/internal-voting/quick-search", {
    params,
  });

  return data.items ?? data ?? [];
}