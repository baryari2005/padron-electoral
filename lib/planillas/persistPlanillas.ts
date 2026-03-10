export async function persistPlanilla(
  tx: any,
  numero: string | undefined,
  eleccionId: number
) {
  if (!numero) return null;

  const clean = numero.trim();

  const existing = await tx.planilla.findUnique({
    where: {
      numero_eleccionId: {
        numero: clean,
        eleccionId,
      },
    },
  });

  if (existing) return existing;

  return tx.planilla.create({
    data: {
      numero: clean,
      eleccionId,
    },
  });
}