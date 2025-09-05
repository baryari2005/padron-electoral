"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, AlertTriangle, ArrowLeft, FileDown, CircleFadingArrowUp } from "lucide-react";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";
import { Cargando } from "@/components/ui/upload";
import { Label } from "@/components/ui/label";

type StatsResponse = {
    totals: { total: number; votaron: number; noVotaron: number; participacion: number };
};

export default function ExportNoVotaronPage() {
    const canView = useHasPermission("ver_estadoelector");

    const sp = useSearchParams();
    const router = useRouter();

    const establecimientoId = sp.get("establecimientoId") || "";
    const mesaId = sp.get("mesaId") || "";
    const q = sp.get("q") || "";

    const [phase, setPhase] = useState<"idle" | "counting" | "exporting" | "done" | "error">("idle");
    const [count, setCount] = useState<number>(0);
    const [downloadUrl, setDownloadUrl] = useState<string>("");
    const [filename, setFilename] = useState<string>("no-votaron.xlsx");
    const [errorMsg, setErrorMsg] = useState<string>("");

    const niceName = useMemo(() => {
        const parts = ["no-votaron"];
        if (establecimientoId) parts.push(`est${establecimientoId}`);
        if (mesaId) parts.push(`mesa${mesaId}`);
        if (q.trim()) parts.push(q.trim().slice(0, 20).replace(/\s+/g, "_"));
        return `${parts.join("-")}-${Date.now()}.xlsx`;
    }, [establecimientoId, mesaId, q]);

    // Si cambian filtros → resetea la pantalla
    useEffect(() => {
        setPhase("idle");
        setCount(0);
        setErrorMsg("");
        if (downloadUrl) {
            URL.revokeObjectURL(downloadUrl);
            setDownloadUrl("");
        }
    }, [establecimientoId, mesaId, q]);

    // Limpieza al desmontar
    useEffect(() => {
        return () => {
            if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        };
    }, [downloadUrl]);

    const runExport = async () => {
        try {
            setErrorMsg("");
            setPhase("counting");

            // Revocar enlace anterior si existe
            if (downloadUrl) {
                URL.revokeObjectURL(downloadUrl);
                setDownloadUrl("");
            }

            // 1) Contar no votantes
            const { data: s } = await axiosInstance.get<StatsResponse>("/api/electoral-rolls/stats", {
                params: {
                    establecimientoId: establecimientoId || undefined,
                    mesaId: mesaId || undefined,
                    q: q?.trim() || undefined,
                    top: 0,
                },
            });
            setCount(s?.totals?.noVotaron ?? 0);

            // 2) Generar Excel
            setPhase("exporting");
            const { data } = await axiosInstance.get<ArrayBuffer>("/api/electoral-rolls/export-not-voted", {
                params: {
                    establecimientoId: establecimientoId || undefined,
                    mesaId: mesaId || undefined,
                    q: q?.trim() || undefined,
                },
                responseType: "arraybuffer",
            });

            const blob = new Blob([data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setFilename(niceName);
            setPhase("done");

            // Si preferís auto-descargar, descomentá:
            // const a = document.createElement("a");
            // a.href = url;
            // a.download = niceName;
            // a.click();

        } catch (err: any) {
            setErrorMsg(err?.response?.data?.error ?? "No se pudo generar el Excel.");
            setPhase("error");
        }
    };

    if (!canView) return <AccessDeniedPage subtitle="Exportar no votantes." />;

    const isRunning = phase === "counting" || phase === "exporting";

    return (
        <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow space-y-6">
                <div className="space-y-2">
                    <Label>Esta función identifica a los electores ausentes, compila la información y la exporta en formato Excel (.xlsx) para su posterior análisis y distribución.</Label>
                </div>

                <Card className="p-4 space-y-4">
                    {/* Acciones */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Button onClick={runExport} disabled={isRunning} className="w-full">
                            <CircleFadingArrowUp className="w-5 h-5 mr-2" />
                            {isRunning ? (
                                <Cargando variant="inline" labelSize="text-sm" label="Generando excel" />
                            ) : phase === "done" ? (
                                <>Re-generar</>
                            ) : (
                                <>Generar Excel</>
                            )}
                        </Button>

                        {phase === "done" && downloadUrl && (
                            <a
                                href={downloadUrl}
                                download={filename}
                                className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-accent"
                            >
                                <FileDown className="h-4 w-4 mr-2" />
                                Descargar {filename}
                            </a>
                        )}
                    </div>

                    <Separator />

                    {/* Progreso */}
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Step label="Contando no votantes" active={phase === "counting"} done={phase !== "idle" && phase !== "counting"} />
                        <Step label="Generando Excel" active={phase === "exporting"} done={phase === "done"} />
                        <Step label="Listo" active={phase === "done"} done={phase === "done"} />
                    </div>

                    {phase === "error" && (
                        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {errorMsg}
                        </div>
                    )}

                    {phase === "done" && (
                        <div className="rounded-md border p-3">
                            <div className="text-sm text-muted-foreground">Resultado</div>
                            <div className="mt-1 text-lg">
                                No votaron: <strong>{count}</strong> persona{count === 1 ? "" : "s"}.
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

function Step({ label, active, done }: { label: string; active?: boolean; done?: boolean }) {
    return (
        <div className="flex items-center gap-2 rounded-md border p-3">
            {done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Loader2 className={`h-4 w-4 ${active ? "animate-spin" : "opacity-40"}`} />}
            <div className="text-sm">{label}</div>
        </div>
    );
}
