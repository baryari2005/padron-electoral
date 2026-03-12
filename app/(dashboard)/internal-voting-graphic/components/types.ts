export type GraphicFormValues = {
  referenteId: string;
  planilleroId: string;
  planillaId: string;
  query: string;
  view: "grid" | "table";
};

export type PersonOption = {
  id: string;
  nombre: string;
};

export type PlanillaOption = {
  id: string;
  nombre: string;
};

export type InternalGraphicVoter = {
  id: string;
  apellido: string;
  nombre: string;
  dni?: string | null;
  votoSiNo?: boolean | "S" | "N" | null;
  votedAt?: string | null;
  numeroOrden?: number | null;
  numeroPlanilla?: string | number | null;
  nombrePlanilla?: string | null;
  referente?: string | null;
  planillero?: string | null;
  establecimientoNombre?: string | null;
  mesaNumero?: number | null;
};

export type PendingMark = {
  electorId: string;
  voted: boolean;
};

export type searchStats = {
   total: number;
    voted: number;
    notVoted: number;
}