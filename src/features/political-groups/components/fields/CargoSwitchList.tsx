"use client";

import { Label } from "@/components/ui/label";
import { Cargando } from "@/components/ui/upload";
import { Control, Controller } from "react-hook-form";
import { Cargo } from "../../services/politicalGroups.service";
import { Switch } from "@/components/ui/switch";

export function CargoSwitchList<T extends Record<string, any>>({
    control,
    cargos,
    loading,
    readOnly,
}: {
    control: Control<T>;
    cargos: Cargo[];
    loading: boolean;
    readOnly?: boolean;
}) {
    const toggleId = (current: number[] | undefined, id: number, checked: boolean) => {
        const s = new Set(current ?? []);
        if (checked) s.add(id);
        else s.delete(id);
        return Array.from(s);
    };


    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Compite en cargo político?</Label>
                <span className="text-xs text-muted-foreground">
                    {loading ? "…" : (
                        <Controller
                            control={control}
                            name={"cargoIds" as any}
                            render={({ field }) => (Array.isArray(field.value) ? field.value.length : 0)}
                        />
                    )}
                </span>
            </div>


            {loading ? (
                <Cargando variant="container" labelSize="text-sm" label="Cargando cargos habilitados..." />
            ) : (
                <Controller
                    control={control}
                    name={"cargoIds" as any}
                    render={({ field }) => {
                        const selected: number[] = Array.isArray(field.value)
                            ? (field.value as unknown as number[])
                            : [];
                        return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {cargos.map((c) => {
                                    const idNum = Number(c.id);
                                    const checked = selected.includes(idNum);
                                    return (
                                        <label key={idNum} className="flex items-center justify-between rounded p-2">
                                            <span className="text-xs">{c.nombre}</span>
                                            <Switch
                                                checked={checked}
                                                disabled={readOnly}
                                                onCheckedChange={(v) => field.onChange(toggleId(selected, idNum, Boolean(v)))}
                                                aria-label={`Habilitar ${c.nombre}`}
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        );
                    }}
                />
            )}


            {readOnly && <p className="text-xs text-muted-foreground">(Solo lectura)</p>}
        </div>
    );
}