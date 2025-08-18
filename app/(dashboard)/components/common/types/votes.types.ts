// tipos compartidos de votos / agrupaciones
export type Resultado = {
  categoria: string;
  agrupacion: string;
  logo?: string | null;
  votos: number;
};

export type AgrupacionConTotales = {
  nombre: string;
  totalVotos: number;
  logo?: string | null;
};

export type DataItem = {
  nombre: string;
  logo?: string | null;
  totalVotos: number;
};