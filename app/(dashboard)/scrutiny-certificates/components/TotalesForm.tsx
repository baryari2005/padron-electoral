"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn, useWatch } from "react-hook-form";
import { CertificadoFormData } from "../utils/schema";
import { FormItemNumberAndLyrics } from "../../components/FormsCreate";
import { useEffect } from "react";


interface TotalesFormProps {
    control: UseFormReturn<CertificadoFormData>["control"];
    setValue: UseFormReturn<CertificadoFormData>["setValue"];
}

export default function TotalesForm({ control, setValue }: TotalesFormProps) {
    const sobres = useWatch({ control, name: "totales.sobres" }) ?? 0;
    const votantes = useWatch({ control, name: "totales.votantes" }) ?? 0;

    useEffect(() => {
        if (!isNaN(sobres) && !isNaN(votantes)) {
            setValue("totales.diferencia", votantes - sobres );
        }
    }, [sobres, votantes, setValue]);

    const campos = [
        { name: "votantes", label: "Cantidad de electores que han votado" },
        { name: "sobres", label: "Cantidad de sobres en la urna" },
        { name: "diferencia", label: "Diferencia" },
    ] as const;

    return (
        <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campos.map(({ name, label }) => (
                    <FormItemNumberAndLyrics<CertificadoFormData>
                        key={name}
                        control={control}
                        name={`totales.${name}`}
                        label={label}                        
                        disabled={name === "diferencia"}
                    />
                ))}
            </div>
        </div>
    );
}
