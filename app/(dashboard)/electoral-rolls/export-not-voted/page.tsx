"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, AlertTriangle, ArrowLeft, FileDown } from "lucide-react";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";

type StatsResponse = {
  totals: { total: number; votaron: number; noVotaron: number; participacion: number };
};

export default function ExportNoVotaronPage() {
  const canView = useHasPermission("ver_estadoelector");
  if (!canView) return <AccessDeniedPage subtitle="Exportar no votantes." />;

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

  // nombre de archivo “lindo”
  const niceName = useMemo(() => {
    const parts = ["no-votaron"];
    if (establecimientoId) parts.push(`est${establecimientoId}`);
    if (mesaId) parts.push(`mesa${mesaId}`);
    if (q.trim()) parts.push(q.trim().slice(0, 20).replace(/\s+/g, "_"));
    return `${parts.join("-")}-${Date.now()}.xlsx`;
  }, [establecimientoId, mesaId, q]);

  useEffect(() => {
    let urlToRevoke: string | null = null;

    const run = async () => {
      try {
        setPhase("counting");

        // 1) contar no votantes (para informar)
        const { data: s } = await axiosInstance.get<StatsResponse>("/api/electoral-rolls/stats", {
          params: {
            establecimientoId: establecimientoId || undefined,
            mesaId: mesaId || undefined,
            q: q?.trim() || undefined,
            top: 0, // no necesitamos rankings acá
          },
        });
        setCount(s?.totals?.noVotaron ?? 0);

        // 2) generar excel
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
        urlToRevoke = URL.createObjectURL(blob);
        setDownloadUrl(urlToRevoke);
        setFilename(niceName);
        setPhase("done");
      } catch (err: any) {
        setErrorMsg(err?.response?.data?.error ?? "No se pudo generar el Excel.");
        setPhase("error");
      }
    };

    run();

    return () => {
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [establecimientoId, mesaId, q, niceName]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Exportar no votantes</h1>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        {/* <div className="text-sm text-muted-foreground">
          Filtros usados:
          <ul className="list-disc ml-5 mt-1">
            <li>Establecimiento: <strong>{establecimientoId || "—"}</strong></li>
            <li>Mesa: <strong>{mesaId || "—"}</strong></li>
            <li>Búsqueda: <strong>{q || "—"}</strong></li>
          </ul>
        </div>

        <Separator /> */}

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
            <div className="mt-3">
              <a
                href={downloadUrl}
                download={filename}
                className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-accent"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Descargar {filename}
              </a>
            </div>
          </div>
        )}
      </Card>
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
