// app/(dashboard)/tools/CleanResultsForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    ShieldAlert,
    Trash2,
    Database,
    Timer,
    Gauge,
    RefreshCw,
    FileStack,
} from "lucide-react";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";

type TableName =
    | "ResultadoPorAgrupacionPolitica"
    | "ResultadoPorMesa"
    | "ResultadoVotosEspeciales"
    | "DiferenciasPorCargosPoliticos"
    | "MesaEscrutada";

type GetResp = {
    ok: true;
    before: Record<TableName, number>;
    durationMs: number;
};

type PostResp = {
    ok: true;
    before: Record<TableName, number>;
    after: Record<TableName, number>;
    deleted: Record<TableName, number>;
    durationMs: number;
};

const ES_LABEL: Record<TableName, string> = {
    ResultadoPorAgrupacionPolitica: "Cantidad de Registros por agrupación",
    ResultadoPorMesa: "Cantidad de Registros por mesa",
    ResultadoVotosEspeciales: "Cantidad de Registros de Votos especiales",
    DiferenciasPorCargosPoliticos: "Cantidad de Registros Diferencias por cargos",
    MesaEscrutada: "Mesas escrutadas",
};

const fmt = (n: number) => n.toLocaleString("es-AR");
const seconds = (ms: number) => (ms / 1000).toFixed(2);

export default function CleanResultsForm() {
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [current, setCurrent] = useState<Record<TableName, number> | null>(null);
    const [result, setResult] = useState<PostResp | null>(null);
    const [confirmText, setConfirmText] = useState("");

    const canClean = useHasPermission("eliminar_resultados"); // ajustá al permiso real

    const totalPendiente = useMemo(
        () => (current ? Object.values(current).reduce((a, b) => a + b, 0) : 0),
        [current]
    );

    async function refreshCounts() {
        try {
            setChecking(true);
            setResult(null);
            const res = await fetch("/api/scrutiny-certificates/clean", { method: "GET" });
            const json = (await res.json()) as GetResp | { ok: false; error: string };
            if (!json.ok) throw new Error((json as any).error || "No se pudo consultar");
            setCurrent(json.before);
        } catch (e: any) {
            toast.error(e?.message || "No se pudo consultar el estado");
        } finally {
            setChecking(false);
        }
    }

    useEffect(() => {
        refreshCounts();
    }, []);

    async function runCleanup() {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch("/api/scrutiny-certificates/clean", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirm: true }),
            });
            const json = (await res.json()) as PostResp | { ok: false; error: string };
            if (!json.ok) throw new Error((json as any).error || "No se pudo limpiar");
            setResult(json as PostResp);
            setCurrent((json as PostResp).after);
            toast.success("Resultados limpiados correctamente.");
            setConfirmText("");
        } catch (e: any) {
            toast.error(e?.message || "Fallo al limpiar");
        } finally {
            setLoading(false);
        }
    }

    if (!canClean) return <AccessDeniedPage subtitle="Limpiar resultados de escrutinio." />;
    return (
        <div className="space-y-6">
            {/* Peligro */}
            <Card className="border-destructive/30">
                <CardHeader>
                    <CardTitle className="text-sm-plus text-destructive flex items-center gap-2 animate-pulse">
                        <ShieldAlert className="w-6 h-6" />
                        Limpieza de resultados de escrutinio
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Label className="text-sm text-muted-foreground animate-pulse">
                        Esta acción es irreversible y eliminará de manera permanente todos los registros de certificados de escrutinio cargados en el sistema. Proceda con precaución.
                    </Label>

                    <div className="flex items-center gap-2">
                        <Label htmlFor="confirm" className="text-xs text-muted-foreground">
                            Escribí <b>“LIMPIAR”</b> para habilitar
                        </Label>
                        <Input
                            id="confirm"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder='LIMPIAR'
                            className="max-w-[200px] h-8"
                        />
                        <Button
                            variant="destructive"
                            disabled={loading || confirmText !== "LIMPIAR"}
                            onClick={runCleanup}
                            className="ml-auto"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {loading ? "Limpiando..." : "Limpiar resultados"}
                        </Button>
                    </div>

                    <Separator />

                    {/* Estado actual */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Database className="w-4 h-4" />
                        Estado actual en base de datos
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={refreshCounts}
                            disabled={checking}
                            className="ml-auto"
                            title="Actualizar"
                        >
                            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {current &&
                            (Object.keys(current) as TableName[]).map((k) => (
                                <Card key={k} className="rounded-2xl shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs text-muted-foreground">{ES_LABEL[k]}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex items-center">
                                        <FileStack className="w-4 h-4 mr-2" />
                                        <div className="text-lg font-semibold tabular-nums">{fmt(current[k])}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        {current && (
                            <Card className="rounded-2xl shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs text-muted-foreground">Total registros</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center">
                                    <FileStack className="w-4 h-4 mr-2" />
                                    <div className="text-lg font-semibold tabular-nums">{fmt(totalPendiente)}</div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Resultado de la limpieza */}
            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                            <Gauge className="w-4 h-4" />
                            Resultado de la operación
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {(Object.keys(result.deleted) as TableName[]).map((k) => (
                                <Card key={k} className="rounded-2xl shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs text-muted-foreground">{ES_LABEL[k]}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-lg font-semibold tabular-nums">
                                            −{fmt(result.deleted[k])}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Quedaron {fmt(result.after[k])}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            <Card className="rounded-2xl shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs text-muted-foreground">Duración</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-semibold tabular-nums">
                                        {seconds(result.durationMs)} s
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
