import { Prisma } from "@prisma/client";

export type MesaEscrutadaConDatosCompletos = Prisma.MesaEscrutadaGetPayload<{
  include: {
    establecimiento: {
      include: { circuito: true };
    };
    resultadosAgrupaciones: {
      include: { agrupacionPolitica: true; cargoPolitico: true };
    };
    resultadosEspeciales: {
      include: { cargoPolitico: true };
    };
    resultadoFinal: true;
  };
}>;