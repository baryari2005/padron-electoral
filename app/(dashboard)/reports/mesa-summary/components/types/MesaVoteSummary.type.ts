// mesaVoteSummary.type.ts

export interface MesaVoteSummary {
  mesaId: number;
  numero: number;
  establecimiento: string;
  circuito: string;
  establecimientoId: number;
  resultados: {
    categoria: string;
    agrupacion: string;
    logo?: string | null;
    votos: number;
  }[];
  votosEspeciales: {
    categoria: string;
    tipo: string;
    cantidad: number;
  }[];
  resumen: {
    sobresEnUrna: number;
    electoresVotaron: number;
    diferencia: number;
  } | null;
}
