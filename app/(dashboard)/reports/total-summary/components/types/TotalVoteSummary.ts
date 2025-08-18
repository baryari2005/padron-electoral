// app/(dashboard)/reports/components/types.ts

export interface TotalVoteSummary {
  resultados: {
    categoria: string;
    agrupacion: string;
    color_hex?: string;
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
