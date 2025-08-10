/** Tipos */
export type Elector = {
  id: string;
  numeroMatricula: string;
  apellido: string;
  nombre: string;
  mesaId: string;
  votedAt: string | null;
  votedBy?: string | null;
  votoSiNo?: "S" | "N" | null;
};

export type Mesa = { id: string; numero: number };
export type Establecimiento = { id: string; nombre: string };
export type PendingMark = { electorId: string; voted: boolean };
