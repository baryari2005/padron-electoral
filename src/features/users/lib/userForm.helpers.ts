// src/features/users/lib/userForm.helpers.ts
import { z } from "zod";

import type { Usuario } from "@prisma/client";
import { userSchema } from "@/app/(dashboard)/users/lib";

export const buildUserSchema = (isEdit: boolean) => userSchema(isEdit);

export type BuildUserSchemaIn<T extends z.ZodTypeAny> = z.input<T>;
export type BuildUserSchemaOut<T extends z.ZodTypeAny> = z.output<T>;

export const getEscuelasIdsFromUser = (u?: (Usuario & {
    escuelas?: { establecimientoId: number }[];
    escuelasIds?: number[];
})) => u?.escuelasIds ?? u?.escuelas?.map(e => e.establecimientoId) ?? [];

export const uiAvatarFrom = (fullName: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=404040&color=fff&size=128&rounded=true&bold=true&format=png`;
