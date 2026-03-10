// Tipos de columnas como vienen en el XLSX
export type ElectoralXlsxRow = {
  TX_CIRCUITO?: string;                 // "001 - Centro"
  ESTBLECIMIENTO?: string;
  DIRECCION_ESTABLECIMIENTO?: string;
  NUMERO_MESA?: number | string;
  NU_ORDEN_MESA?: number | string;
  DISTRITO?: string;
  TX_TIPO_EJEMPLAR?: string;
  NU_MATRICULA?: number | string;
  TX_APELLIDO?: string;
  TX_NOMBRE?: string;
  TX_CLASE?: number | string;
  TX_GENERO?: string;
  TX_DOMICILIO?: string;
  TX_SECCION?: string;
  TX_LOCALIDAD?: string;
  TX_CODIGO_POSTAL?: string | number;
  TX_TIPO_NACIONALIDAD?: string;
  voto_sino?: "S" | "N" | string;
};

export type ImportErrorDetail = {
  numeroMatricula: string;
  nombre: string;
  apellido: string;
  motivo: string;
};

export type ImportResult = {
  rows: number;                 // insertados en padrón
  people: number;               // alias de rows
  establishments: number;       // establecimientos creados
  circuits: number;             // circuitos creados
  mesasCreadas: number;         // mesas creadas
  errors: number;
  errorDetails: ImportErrorDetail[];
  statsPersonas?: {
    REFERENTE: number;
    PLANILLERO: number;
    CHOFER: number;
  }
};

export type ImportMode = "replace" | "append";

export type ImportOptions = {
  buffer: Buffer;
  userId: string;
  mode: ImportMode;
  debug?: boolean;
};