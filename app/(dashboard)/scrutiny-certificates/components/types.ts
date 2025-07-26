export type EstablecimientoConCircuito = {
  id: string;
  nombre: string;
  circuito: {
    id: string;
    nombre: string;
    codigo: string;
  };
};
