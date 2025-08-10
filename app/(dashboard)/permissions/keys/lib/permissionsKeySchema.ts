import { formatMessage } from "@/lib/utils/formatters";
import { ACCIONES, MODULOS } from "@/utils/permissions";
import { z } from "zod";

export const permissionFormSchema = z.object({

clave: z
    .string()
    .transform((val) => val.toLowerCase()),
    descripcion: z
    .string()    
    .transform((val) => val.toUpperCase()),
    modulo: z
    .enum(MODULOS),
    accion: z
    .enum(ACCIONES),
});

export type PermissionFormValues = z.infer<typeof permissionFormSchema>;