export interface ElectoralRoll {
  id?: number;
  distrito: string;
  tipo_ejemplar?: string;
  numeroMatricula: string;
  apellido?: string;
  nombre?: string;
  clase: number;
  genero: string;
  domicilio: string;
  seccion: string;
  circuitoId: number;
  localidad: string;
  codigo_postal: string;
  tipo_nacionalidad: string;
  numero_mesa: number;
  orden_mesa: number;
  establecimientoId: number;
  voto_sino: "SI" | "NO";
}

export interface FormElectoralRollProps {
  padron?: ElectoralRoll; // si se pasa, es edición
  modo?: "ver" | "editar";
  onSuccess: () => void;
  onClose?: () => void;
}
