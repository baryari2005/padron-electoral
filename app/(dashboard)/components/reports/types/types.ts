export type Resultado = {
  categoria: string;
  agrupacion: string;
  votos: number;
  logo?: string | null;
};

export type Resumen =
  | { electoresVotaron?: number; sobresEnUrna?: number }
  | null
  | undefined;

export type VotoEspecial = any;
