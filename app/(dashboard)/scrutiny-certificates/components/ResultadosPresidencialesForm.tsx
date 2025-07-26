"use client";

import { Control, useFieldArray, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    FormField,
    FormItem,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { CertificadoFormData } from "../utils/schema";
import { getAvatarUrl } from "@/utils/avatar";

interface Categoria {
    id: string;
    nombre: string;
}

interface ResultadosPresidencialesFormProps {
    control: Control<CertificadoFormData>;
    resultadosPresidenciales: CertificadoFormData["resultadosPresidenciales"];
    categorias: Categoria[];
}

export function ResultadosPresidencialesForm({
    control,
    resultadosPresidenciales,
    categorias,
}: ResultadosPresidencialesFormProps) {
    const { fields } = useFieldArray({
        control,
        name: "resultadosPresidenciales",
    });

    const valores = useWatch({ control, name: "resultadosPresidenciales" });
    const [totales, setTotales] = useState<Record<string, number>>({});

    const gridStyle = {
        gridTemplateColumns: `60px 1fr 80px repeat(${categorias.length}, 100px)`
    };

    useEffect(() => {
        const nuevosTotales: Record<string, number> = {};
        categorias.forEach((cat) => {
            nuevosTotales[cat.id] =
                valores?.reduce((sum, r) => sum + (Number((r as any)[cat.id]) || 0), 0) || 0;
        });
        setTotales(nuevosTotales);
    }, [valores, categorias]);

    return (
        <div className="space-y-4">
            {/* Encabezado */}
            <div style={gridStyle} className="grid font-semibold text-xs gap-2 px-2">
                <div>LOGO</div>
                <div>AGRUPACIONES POLITICAS</div>
                <div>NÚMERO</div>
                {categorias.map((cat) => (
                    <div key={cat.id} className="text-center">
                        {cat.nombre.toUpperCase()}
                    </div>
                ))}
            </div>

            <Separator />

            {/* Filas de datos */}
            {fields.map((field, index) => {
                const resultado = resultadosPresidenciales[index];
                const nombre = resultado?.nombre ?? "SIN NOMBRE";
                const numero = resultado?.numero ?? "-";
                const imagen = getAvatarUrl(nombre, resultado?.profileImage ?? undefined);

                return (
                    <div
                        key={field.id}
                        style={gridStyle}
                        className="grid items-center gap-2 even:bg-muted/50 p-2 rounded-md"
                    >
                        <div>
                            <img
                                src={imagen}
                                alt="Logo"
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                            />
                        </div>

                        <div className="text-sm flex items-center gap-1">
                            {nombre}
                        </div>
                        <div className="text-sm flex items-center gap-1">
                            {numero}
                        </div>
                        {categorias.map((cat) => (
                            <FormField
                                key={cat.id}
                                name={`resultadosPresidenciales.${index}.${cat.id}` as const}
                                control={control}                                
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                className="h-8 text-sm px-2 text-right"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))} 
                                                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                );
            })}

            <Separator />

            {/* Totales */}
            <div
                style={gridStyle}
                className="grid font-bold text-sm">
                <div className="col-span-3 uppercase">total votos</div>
                {categorias.map((cat) => (
                    <div key={cat.id} className="text-right mr-4">
                        {totales[cat.id] ?? 0}
                    </div>
                ))}
            </div>
        </div>
    );
}
