import { formatMessage } from "@/lib/utils/formatters";
import { z } from "zod";

const anioMaximo = new Date().getFullYear() - 16;
const anioMinimo = new Date().getFullYear() - 110;

export const electoralRollSchema = z.object({
  distrito: z.string().min(1, "El distrito es obligatorio"),
  tipoEjemplar: z.string().min(1, "Tipo de ejemplar es obligatorio"),
  numeroMatricula: z.string().min(1, "La matrícula es obligatoria"),
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
  seccion: z.string().min(1, "La sección es obligatoria."),
  circuitoId: z.coerce.number().int().min(1, "El circuito es obligatorio."),
  localidad: z.string().min(1, "La localidad es obligatoria."),
  codigoPostal: z.string(),
  tipoNacionalidad: z.string().min(1, "Nacionalidad es obligatorio."),
  numeroMesa: z.coerce.number().int().min(1, "El número de mesa es obligatorio"),
  ordenMesa: z.coerce.number().int().min(1, "El número de orden es obligatorio").max(400, "El número de orden no puede ser mayor a 400."),
  establecimientoId: z.coerce.number().int().min(1, "El establecimiento es obligatorio."),
  telefono: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(val),
      {
        message: formatMessage("Formato de teléfono inválido"),
      }
    )
    .transform((val) => (val ? val.toUpperCase() : undefined)),
  votoSiNo: z.enum(["S", "N"]),
  referenteId: z.number().nullable().optional(),
  planilleroId: z.number().nullable().optional(),
  choferId: z.number().nullable().optional(),
  planillaId: z.number().nullable().optional(),
});

export type ElectoralRollFormValues = z.infer<typeof electoralRollSchema>;
