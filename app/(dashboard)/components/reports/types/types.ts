export type Resultado = {
  categoria: string;
  agrupacion: string;
  votos: number;
  color?: string | null;
  logo?: string | null;
};

export type Resumen =
  | { electoresVotaron?: number; sobresEnUrna?: number }
  | null
  | undefined;

export type VotoEspecial = any;
