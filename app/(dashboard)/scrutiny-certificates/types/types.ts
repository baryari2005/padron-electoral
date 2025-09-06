/**
 * Tipos compartidos para la feature: scrutiny-certificates
 * --------------------------------------------------------
 * Usados por hooks, componentes y requests de API.
 */

/** Filtros del header (Circuito y Establecimiento) */
export type CertificatesFilters = {
  circuitoId?: number;
  establecimientoId?: number;
};

/** Respuesta genérica de endpoints que devuelven listas */
export type ApiListResponse<T> = { items: T[] };

/** Catálogo de circuitos */
export type CircuitoCat = {
  id: number;
  nombre: string;
  codigo: string;
  /** opcional, algunos endpoints lo incluyen */
  localidad?: string;
};

/** Catálogo de establecimientos */
export type EstablecimientoCat = {
  id: number;
  nombre: string;
  /** para poder relacionar con circuito (cuando el summary no lo trae) */
  circuitoId?: number;
  /** opcional */
  localidad?: string;
};

/** Totales por mesa */
export type TotalesMesa = {
  sobresEnUrna: number;
  electoresVotaron: number;
  /** diferencia = electoresVotaron - sobresEnUrna (o la métrica que uses) */
  diferencia: number;
};

/** Diferencias por categoría (líneas “Total boletas de …”) */
export type DiferenciaPorCategoria = {
  categoriaId: number;
  diferencia: number; // positivo/negativo
  categoria: { nombre: string };
};

/** Resumen de una mesa dentro del summary */
export type MesaResumen = {
  id: number;
  numero: string;
  createdAt?: string;
  totalMesa: TotalesMesa | null;
  diferenciasPorCategoria?: DiferenciaPorCategoria[];
};

/** Resumen de establecimiento (escuela) tal como llega en /summary */
export type EstablecimientoResumen = {
  id: number;
  nombre: string;
  direccion: string;

  /** a veces viene anidado … */
  circuito?: { id?: number; nombre?: string; localidad?: string };
  /** …y a veces plano */
  circuitoId?: number;

  mesa: MesaResumen[];

  /**
   * Campos derivados en UI (no vienen del backend):
   * – _circuitoId: calculado desde circuitoId || circuito.id || catálogo
   * – _circuitoNombre: calculado desde circuito.nombre || catálogo
   */
  _circuitoId?: number;
  _circuitoNombre?: string;
};

/** Tipo simple para combos/ formularios de categorías */
export type Categoria = {
  id: string;    // puede ser UUID o slug
  nombre: string;
};

/** Claves válidas de filas en VotosEspecialesForm */
export type VotoEspecialKey =
  // | "nulos"
  // | "recurridos"
  | "impugnados"
  // | "comandoElectoral"
  | "blancos";

/** Auxiliar: respuesta de summary tipada (por comodidad en axios.get) */
export type SummaryResponse = ApiListResponse<EstablecimientoResumen>;
