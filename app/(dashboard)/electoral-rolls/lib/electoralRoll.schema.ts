import { z } from "zod";

const anioMaximo = new Date().getFullYear() - 16;
const anioMinimo = new Date().getFullYear() - 110;

export const electoralRollSchema = z.object({
  distrito: z.string().min(1, "El distrito es obligatorio"),
  tipo_ejemplar: z.string().min(1, "Tipo de ejemplar es obligatorio"),
  numero_matricula: z.string().min(1, "La matrícula es obligatoria"),
  apellido: z.string().min(1, "Apellido es obligatorio"),
  nombre: z.string().min(1, "Nombre es obligatorio"),
  clase: z
    .coerce
    .number()
    .int()
    .min(anioMinimo, { message: `El año de nacimiento no puede ser menor que ${anioMinimo}` })
    .max(anioMaximo, {
      message: `El año de nacimiento no puede ser mayor que ${anioMaximo}`,
    }),
  genero: z.enum(["M", "F", "X"], {
    errorMap: () => ({ message: "Debe seleccionar un género válido: M, F o X" }),
  }),
  domicilio: z.string().min(1, "El domicilio es obligatorio."),
  seccion: z.string().min(1,  "La sección es obligatoria."),
  circuitoId: z.coerce.number().int().min(1, "El circuito es obligatorio."),
  localidad: z.string().min(1, "La localidad es obligatoria."),
  codigo_postal: z.string().optional(),
  tipo_nacionalidad: z.string().min(1, "Nacionalidad es obligatorio."),
  numero_mesa: z.coerce.number().int().min(1, "El número de mesa es obligatorio").max(30, "El número de mesa no puede ser mayor a 30."),
  orden_mesa: z.coerce.number().int().min(1, "El número de orden es obligatorio").max(400, "El número de orden no puede ser mayor a 400."),
  establecimientoId: z.coerce.number().int().min(1, "El establecimiento es obligatorio."),
  voto_sino: z.enum(["SI", "NO"]),
});

export type ElectoralRollFormValues = z.infer<typeof electoralRollSchema>;
