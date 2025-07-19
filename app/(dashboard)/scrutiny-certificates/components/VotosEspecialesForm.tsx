"use client";

import { Control, useWatch, useFormContext  } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { CertificadoFormData } from "../utils/schema";
import { useEffect, useState } from "react";

interface Categoria {
    id: string;
    nombre: string;
}

interface VotosEspecialesFormProps {
    control: Control<CertificadoFormData>;
    categorias: Categoria[];
}

export default function VotosEspecialesForm({ control,
    categorias }: VotosEspecialesFormProps) {
    const { setValue, getValues } = useFormContext<CertificadoFormData>();
    const valores = useWatch({ control, name: "votosEspeciales" });

    const [totales, setTotales] = useState<Record<string, number>>({});

    const items: {
        key: keyof CertificadoFormData["votosEspeciales"]["presidente"];
        label: string;
        sub?: string;
    }[] = [
            { key: "nulos", label: "VOTOS NULOS" },
            { key: "recurridos", label: "VOTOS RECURRIDOS", sub: "QUE SE REMITEN EN SOBRE Nro.3" },
            { key: "impugnados", label: "VOTOS DE IDENTIDAD IMPUGNADA", sub: "QUE SE REMITEN EN SOBRE Nro.3" },
            { key: "comandoElectoral", label: "VOTOS DEL COMANDO ELECTORAL", sub: "QUE SE REMITEN EN EL BOLSIN" },
            { key: "blancos", label: "VOTOS EN BLANCO" },
        ];

    const gridStyle = {
        gridTemplateColumns: `1fr repeat(${categorias.length}, 100px)`,
    };

    useEffect(() => {
        categorias.forEach((cat) => {
            items.forEach((item) => {
                const currentValue = getValues(`votosEspeciales.${cat.id}.${item.key}` as const);
                if (currentValue === undefined || currentValue === null) {
                    setValue(`votosEspeciales.${cat.id}.${item.key}` as const, 0);
                }
            });
        });
    }, [categorias, items, getValues, setValue]);

    useEffect(() => {
        const claves = items.map((i) => i.key);
        const nuevosTotales: Record<string, number> = {};

        categorias.forEach((cat) => {
            nuevosTotales[cat.id] =
                claves.reduce(
                    (total, k) => total + Number((valores as any)[cat.id]?.[k] ?? 0),
                    0
                );
        });

        setTotales(nuevosTotales);
    }, [valores, categorias]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div style={gridStyle} className="grid text-xs font-semibold items-center px-2">
                <div className="pl-2">CONCEPTO</div>
                {categorias.map((cat) => (
                    <div key={cat.id} className="text-center">{cat.nombre}</div>
                ))}
            </div>

            <Separator />

            {/* Rows */}
            {items.map((item) => (
                <div key={item.key} style={gridStyle} className="grid items-center text-sm gap-2 px-2 py-1 even:bg-muted/50 rounded">
                    <div className="pl-2">
                        <div className="font-medium">{item.label}</div>
                        {item.sub && <div className="text-xs text-muted-foreground">{item.sub}</div>}
                    </div>

                    {categorias.map((cat) => (
                        <FormField
                            key={cat.id}
                            name={`votosEspeciales.${cat.id}.${item.key}` as const}
                            control={control}
                            render={({ field }) => (
                                <FormItem className="flex justify-center">
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            className="h-8  text-sm px-2 text-right"
                                            {...field}
                                            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
            ))}

            <Separator />

            {/* Totales */}
            <div style={gridStyle} className="grid font-bold text-sm">
                <div className="uppercase">Total por columnas (*)</div>
                {categorias.map((cat) => (
                    <div key={cat.id}
                        className="text-right mr-6">
                        {totales[cat.id] ?? 0}
                    </div>
                ))}
            </div>
        </div>
    );
}
