// src/lib/personas/persistPersonasOperativas.ts

type TipoPersona = "REFERENTE" | "PLANILLERO" | "CHOFER";

export async function persistPersonaOperativa(
  tx: any,
  nombre: string | undefined,
  telefono: string | undefined,
  tipo: TipoPersona,
  eleccionId: number
) {
  if (!nombre) return null;

  const cleanName = nombre.trim().toUpperCase();

  const existing = await tx.personaOperativa.findUnique({
    where: {
      nombre_tipo_eleccionId: {
        nombre: cleanName,
        tipo,
        eleccionId,
      },
    },
  });

  if (existing) {
    // actualizar teléfono si viene nuevo
    if (telefono && telefono !== existing.telefono) {
      await tx.personaOperativa.update({
        where: { id: existing.id },
        data: { telefono },
      });
    }
    return existing;
  }

  return tx.personaOperativa.create({
    data: {
      nombre: cleanName,
      telefono,
      tipo,
      eleccionId,
    },
  });
}