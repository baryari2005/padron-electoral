// src/features/users/hooks/useAutoAvatar.ts
"use client";
import { UseFormReturn, Path, FieldValues } from "react-hook-form";
import { useEffect } from "react";
import { uiAvatarFrom } from "../lib/userForm.helpers";

type Keys<T extends FieldValues> = {
    nombre: Path<T>;
    apellido: Path<T>;
    avatarUrl: Path<T>;
};

export function useAutoAvatar<T extends FieldValues>(
    form: UseFormReturn<T>,
    keys: Keys<T>
) {
    const nombre = form.watch(keys.nombre) as unknown as string;
    const apellido = form.watch(keys.apellido) as unknown as string;

    useEffect(() => {
        const full = `${nombre ?? ""} ${apellido ?? ""}`.trim();
        const cur = form.getValues(keys.avatarUrl) as unknown as string;
        const isCustom = cur && !cur.includes("ui-avatars.com");
        if (full && !isCustom) {
            form.setValue(keys.avatarUrl as any, uiAvatarFrom(full) as any, {
                shouldValidate: true,
            });
        }
    }, [nombre, apellido, form, keys.avatarUrl]);
}
