export type NuevoPadron = {
  distrito: string | null;
  tipoEjemplar: string | null;
  tipoDocumento?: string | null;   // 👈 nuevo (opcional)
  numeroMatricula: string;         // siempre string
  apellido: string | null;
  nombre: string | null;
  clase: number | null;
  genero: string | null;
  domicilio: string | null;
  seccion: string | null;
  localidad: string | null;        // default "San Miguel 2025"
  codigoPostal: string | null;     // default ""
  tipoNacionalidad: string | null; // default "ARGENTINO"
  numeroMesa: number | null;
  ordenMesa: number | null;
  votoSiNo: string | null;         // "S" / "N" (según convención)
  circuitoId: number;
  establecimientoId: number;
  userId: string;
};

export type ImportErrorDetail = {
  numeroMatricula: string;
  nombre: string | null;
  apellido: string | null;
  motivo: string;
};