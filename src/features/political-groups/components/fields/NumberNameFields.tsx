"use client";


import { Control } from "react-hook-form";
import { FormTextField } from "@/app/(dashboard)/components/FormsCreate";


export function NumberNameFields<T extends Record<string, any>>({
    control,
    readOnly,
}: {
    control: Control<T>;
    readOnly?: boolean;
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormTextField
                control={control}
                name={"numero" as any}
                label="Número"
                placeholder="Ej: 130"
                uppercase
                disabled={readOnly}
            />
            <FormTextField
                control={control}
                name={"nombre" as any}
                label="Nombre"
                placeholder="Ej: FUERZA PATRIA"
                uppercase
                disabled={readOnly}
            />
            <FormTextField
                control={control}
                name="orden"
                label="Orden (opcional)"
                placeholder="1"
                type="number"
                min={1}
                step={1}
            />
        </div>
    );
}