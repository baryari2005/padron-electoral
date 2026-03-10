export type GroupByMode = "orden" | "referente" | "planillero" | "planilla";

export type InternalVotingFormValues = {
  establecimientoId: string;
  mesaId: string;
  query: string;
  groupBy: GroupByMode;
  referenteId: string;
  planilleroId: string;
};

export type Mesa = {
  id: string;
  numero: number;
};

export type EstablishmentOption = {
  id: string;
  nombre: string;
};

export type PersonOption = {
  id: string;
  nombre: string;
};

export type PendingMark = {
  electorId: string;
  voted: boolean;
};

export type GroupSummary = {
  id: string;
  label: string;
  total: number;
  voted: number;
  notVoted: number;
};

export type InternalVoter = {
  id: string;
  apellido: string;
  nombre: string;
  dni?: string | null;
  numeroOrden?: number | null;
  votedAt?: string | null;
  votoSiNo?: boolean | null;

  referente?: string | null;
  planillero?: string | null;
  chofer?: string | null;
  numeroPlanilla?: string | null;
  nombrePlanilla?: string | null;
  telefono?: string | null;
  establecimientoNombre?: string | null;
};

export type InternalVotingStats = {
  total: number;
  voted: number;
  notVoted: number;
  pending: number;
};