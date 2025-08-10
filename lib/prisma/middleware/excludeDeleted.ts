import { Prisma } from "@prisma/client";

// Modelos con borrado lógico
const modelsWithSoftDelete = new Set([
  "AgrupacionPolitica",
  "CargoPolitico",
  "Circuito",
  "Establecimiento",
  
  "PadronElectoral",
  "MesaEscrutada",
]);

export const excludeDeletedMiddleware: Prisma.Middleware = async (params, next) => {
  if (
    params.action === "findMany" &&
    modelsWithSoftDelete.has(params.model || "")
  ) {
    params.args = {
      ...params.args,
      where: {
        ...params.args?.where,
        deletedAt: null,
      },
    };
  }

  return next(params);
};
