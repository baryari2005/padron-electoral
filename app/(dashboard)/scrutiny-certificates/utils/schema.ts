import { z } from "zod";

// Subschemas
const mesaSchema = z.object({
  escuelaId: z.string().min(1, "Seleccioná una escuela"),
  numeroMesa: z.string().min(1, "Ingresá el número de mesa"),
});

const resultadoSchema = z.object({
  cargoId: z.string().min(1),
  agrupacionId: z.string().min(1),
  votos: z.number().min(0, "Los votos no pueden ser negativos"),
});

const votosPorColumna = z.object({
  nulos: z.number().min(0),
  recurridos: z.number().min(0),
  impugnados: z.number().min(0),
  comandoElectoral: z.number().min(0),
  blancos: z.number().min(0),
});

const totalesSchema = z.object({
  sobres: z.number().min(0, "Debe ser 0 o más"),
  votantes: z.number().min(0, "Debe ser 0 o más"),
  diferencia: z.number(), // puede ser negativa
});

const resultadoPorCargoSchema = z
  .object({
    numero: z.number(),
    nombre: z.string(),
    profileImage: z.string(),
  })
  .catchall(z.number().min(0));

const votosEspecialesSchema = z
  .object({})
  .catchall(votosPorColumna);

const compensacionSchema = z.object({
  presidente: z.object({
    firma: z.string().min(1, "La firma es requerida"),
    aclaracion: z.string().min(1, "La aclaración es requerida"),
    dni: z.string().regex(/^\d{7,9}$/, "DNI inválido"),
  }),
  vocal: z.object({
    firma: z.string().min(1, "La firma es requerida"),
    aclaracion: z.string().min(1, "La aclaración es requerida"),
    dni: z.string().regex(/^\d{7,9}$/, "DNI inválido"),
  }),
});

export const fiscalSchema = z.object({
  agrupacionId: z.string().min(1, "Agrupación requerida"),
  firma: z.string().min(1, "Firma del fiscal requerida"),
  aclaracion: z.string().min(1, "Aclaración del fiscal requerida"),
  dni: z.string().regex(/^\d{7,9}$/, "DNI inválido (7 a 9 dígitos)"),
});

const firmasSchema = z.object({
  presidente: z.string().min(1, "Ingresá el nombre del presidente de mesa"),
  vocal: z.string().min(1, "Ingresá el nombre del vocal"),
  fiscales: z
    .array(fiscalSchema)
    .min(1, "Debe haber al menos un fiscal cargado"), // ✅ esta línea es la nueva validación
});

// Schema principal
export const certificadoSchema = z.object({
  mesa: mesaSchema,
  resultados: z.array(resultadoSchema).min(1, "Debe haber al menos un resultado cargado"),
  votosEspeciales: votosEspecialesSchema,
  totales: totalesSchema,
  firmas: firmasSchema,
  resultadosPresidenciales: z.array(resultadoPorCargoSchema),
  compensacion: compensacionSchema,
});


export type Fiscal = z.infer<typeof fiscalSchema>;

// ✅ Tipo inferido directamente desde el schema
export type CertificadoFormData = z.infer<typeof certificadoSchema>;
