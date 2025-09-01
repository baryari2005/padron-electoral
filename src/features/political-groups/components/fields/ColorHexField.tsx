"use client";


import { Controller, Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export function ColorHexField<T extends Record<string, any>>({
    control,
    readOnly,
}: {
    control: Control<T>;
    readOnly?: boolean;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">Color de la agrupación</Label>
            <Controller
                control={control}
                name={"color_hex" as any}
                render={({ field }) => (
                    <div className="flex items-center gap-3">
                        <Input
                            type="color"
                            value={field.value}
                            disabled={readOnly}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="h-10 w-16 p-1 cursor-pointer"
                        />
                        <Input
                            type="text"
                            value={field.value}
                            disabled={readOnly}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="flex-1"
                            placeholder="#2D3135"
                        />
                        <div
                            className="h-10 w-10 rounded-md border"
                            style={{ backgroundColor: field.value }}
                            aria-label="Preview color"
                            title={field.value}
                        />
                    </div>
                )}
            />
        </div>
    );
}