// app/(dashboard)/reports/components/types.ts

export interface CircuiteVoteSummary {
  circuito: string;
  circuitoId: string;
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
