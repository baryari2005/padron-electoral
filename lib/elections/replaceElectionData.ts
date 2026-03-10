export async function replaceElectionData(tx: any, eleccionId: number) {

  // RESULTADOS (dependen de MesaEscrutada)

  await tx.resultadoVotosEspeciales.deleteMany({
    where: {
      mesaEscrutada: { eleccionId },
    },
  });

  await tx.resultadoPorAgrupacionPolitica.deleteMany({
    where: {
      mesaEscrutada: { eleccionId },
    },
  });

  await tx.resultadoPorMesa.deleteMany({
    where: {
      mesaEscrutada: { eleccionId },
    },
  });

  await tx.diferenciasPorCargosPoliticos.deleteMany({
    where: {
      mesaEscrutada: { eleccionId },
    },
  });

  await tx.firma.deleteMany({
    where: {
      mesaEscrutada: { eleccionId },
    },
  });

  // MESAS ESCRUTADAS

  await tx.mesaEscrutada.deleteMany({
    where: { eleccionId },
  });

  // PADRON

  await tx.padronElectoral.deleteMany({
    where: { eleccionId },
  });

  // MESAS POR ESTABLECIMIENTO

  await tx.mesasPorEstablecimiento.deleteMany({
    where: { eleccionId },
  });

  // ESTABLECIMIENTOS

  await tx.establecimiento.deleteMany({
    where: { eleccionId },
  });

  // CIRCUITOS

  await tx.circuito.deleteMany({
    where: { eleccionId },
  });

  // PERSONAS OPERATIVAS

  await tx.personaOperativa.deleteMany({
    where: { eleccionId },
  });

  // PLANILLAS

  await tx.planilla.deleteMany({
    where: { eleccionId },
  });
}