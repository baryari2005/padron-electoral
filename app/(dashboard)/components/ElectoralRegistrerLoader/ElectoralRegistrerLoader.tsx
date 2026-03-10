// components/ElectoralRegistrerLoader.tsx
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Landmark, Loader2, User, MapPin } from "lucide-react";
import CardSummary from "../CardSummary/CardSummary";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import axiosInstance from "@/utils/axios";
import { formatApiMessage, formatMessage } from "@/lib/utils/formatters";
import { Cargando } from "@/components/ui/upload";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { TextStatsLoader } from "./TextStatsLoader";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { supabase } from "@/utils/supabaseClient";

type ImportMode = "replace" | "append";

export function ElectoralRegistrerLoader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [rowsImported, setRowsImported] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<{
    rows: number;
    establishments: number;
    people: number;
    circuits: number;
    errors: number;
    statsPersonas?: {
      REFERENTE: number;
      PLANILLERO: number;
      CHOFER: number;
    }
    errorDetails?: { numeroMatricula: string; nombre: string; apellido: string; motivo: string }[];
  } | null>(null);

  // 👇 Nuevo: modo + flags de truncado (opcionales)
  const [mode, setMode] = useState<ImportMode>("append");
  const [truncateCircuito, setTruncateCircuito] = useState(false);
  const [truncateEstablecimiento, setTruncateEstablecimiento] = useState(false);
  const [truncateMesas, setTruncateMesas] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setRowsImported(null);
      setImportSummary(null);
      setProgress(0);
    }
  };

  const simulateProgress = () => {
    setProgress(0);
    let val = 0;
    const interval = setInterval(() => {
      val += Math.random() * 10;
      if (val >= 95) {
        clearInterval(interval);
      } else {
        setProgress(Math.min(val, 100));
      }
    }, 200);
    return interval;
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error(formatApiMessage("required.fileXLS"));
      return;
    }

    setIsUploading(true);
    setRowsImported(null);
    setImportSummary(null);
    const interval = simulateProgress();

    try {
      // 1) Pedir URL firmada al server
      const pre = await axiosInstance.post("/api/uploads/presign", {
        filename: file.name,
        upsert: true,
      });
      const { bucket, path, token } = pre.data;
      if (!bucket || !path || !token) throw new Error("Pre-firma inválida");

      // 2) Subir directo al bucket usando la URL firmada
      const up = await supabase
        .storage
        .from(bucket)
        .uploadToSignedUrl(path, token, file);

      if (up.error) {
        throw new Error(up.error.message || "Fallo la subida al Storage");
      }

      // 3) Avisar a tu API SOLO la ruta + flags
      const res = await axiosInstance.post(
        "/api/electoral-rolls/electoral-rolls-loader",
        {
          path: path,
          mode,
          truncateCircuito,
          truncateEstablecimiento,
          truncateMesas,
        }
      );

      if (res.status !== 200 || !res.data?.ok) {
        throw new Error(formatMessage("Error al importar los datos"));
      }

      setProgress(100);
      setRowsImported(res.data?.rows ?? 0);
      setImportSummary({
        rows: res.data?.rows ?? 0,
        establishments: res.data?.establishments ?? 0,
        people: res.data?.people ?? 0,
        circuits: res.data?.circuits ?? 0,
        errors: res.data?.errors ?? 0,
        statsPersonas: res.data?.statsPersonas,
        errorDetails: res.data?.errorDetails ?? [],
      });

      toast.success(
        `¡Importación ${mode === "replace" ? "con truncado" : "agregada"} exitosa! Registros: ${res.data?.rows ?? 0}`
      );
    } catch (err) {
      console.error("[error]", err);
      toast.error(formatMessage("Error al subir el archivo"));
      setProgress(0);
    } finally {
      clearInterval(interval);
      setIsUploading(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  const handleReset = () => {
    setFile(null);
    setRowsImported(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canCreate = useHasPermission("crear_importarpadron");
  if (!canCreate) return (<AccessDeniedPage subtitle="Importar Padrón Electoral." />);


  return (
    <>
      <div className="rounded-xl border bg-card p-6 shadow space-y-6">
        {/* Selector de modo */}
        <div className="space-y-2">
          <Label>Modo de importación</Label>
          <RadioGroup
            value={mode}
            onValueChange={(v: ImportMode) => setMode(v)}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center gap-2 rounded-md border p-3">
              <RadioGroupItem id="append" value="append" />
              <Label htmlFor="append" className="cursor-pointer">
                Agregar (append)
              </Label>
            </div>
            <div className="flex items-center gap-2 rounded-md border p-3">
              <RadioGroupItem id="replace" value="replace" />
              <Label htmlFor="replace" className="cursor-pointer">
                Truncar y reemplazar (replace)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Archivo */}
        <div className="flex flex-col space-y-2">
          <Label htmlFor="padronFile">Seleccioná el archivo del padrón:</Label>
          <Input
            ref={fileInputRef}
            id="padronFile"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleChange}
            disabled={isUploading}
          />
        </div>
        <Separator />
        <TextStatsLoader />
        <div className="flex items-center gap-4">
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? <Cargando /> : "Subir archivo"}
          </Button>
          {/* <Button variant="outline" onClick={handleReset}>Subir otro archivo</Button> */}
        </div>

        {isUploading && (
          <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {importSummary && (
        <Accordion type="multiple" className="mt-6">
          <AccordionItem value="resumen">
            <AccordionTrigger className="text-primary text-lg font-semibold">
              Resumen de Importación
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CardSummary
                  key="padron"
                  icon={User}
                  total={`${importSummary?.people ?? 0} registros cargados`}
                  title="Padrón Electoral"
                  tooltipText="Cantidad de ciudadanos cargados en el padrón."
                />
                <CardSummary
                  key="establecimientos"
                  icon={Landmark}
                  total={`${importSummary?.establishments ?? 0} establecimientos`}
                  title="Establecimientos"
                  tooltipText="Cantidad de establecimientos únicos importados."
                />
                <CardSummary
                  key="circuitos"
                  icon={MapPin}
                  total={`${importSummary?.circuits ?? 0} circuitos`}
                  title="Circuitos"
                  tooltipText="Cantidad de circuitos únicos importados."
                />
              </div>

              {importSummary?.statsPersonas && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <CardSummary
                    key="referentes"
                    icon={User}
                    total={`${importSummary.statsPersonas.REFERENTE} referentes`}
                    title="Referentes"
                    tooltipText="Cantidad de referentes únicos creados."
                  />
                  <CardSummary
                    key="planilleros"
                    icon={User}
                    total={`${importSummary.statsPersonas.PLANILLERO} planilleros`}
                    title="Planilleros"
                    tooltipText="Cantidad de planilleros únicos creados."
                  />
                  <CardSummary
                    key="choferes"
                    icon={User}
                    total={`${importSummary.statsPersonas.CHOFER} choferes`}
                    title="Choferes"
                    tooltipText="Cantidad de choferes únicos creados."
                  />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          {importSummary?.errors > 0 &&
            Array.isArray(importSummary.errorDetails) &&
            importSummary.errorDetails.length > 0 && (
              <AccordionItem value="errores">
                <AccordionTrigger className="text-red-600 text-lg font-semibold">
                  Errores al importar ({importSummary.errorDetails.length})
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground max-h-60 overflow-y-auto">
                    {(importSummary.errorDetails ?? [])
                      .slice(0, 100)
                      .map((e, i) => (
                        <li key={i}>
                          <strong>{e.numeroMatricula}</strong> -{" "}
                          {e.apellido ? `${e.apellido}, ` : ""}
                          {e.nombre} ({e.motivo})
                        </li>
                      ))}
                  </ul>
                  <p className="text-sm text-gray-500 mt-2 italic">
                    Mostrando los primeros 100 errores.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => {
                      const blob = new Blob(
                        [JSON.stringify(importSummary.errorDetails, null, 2)],
                        { type: "application/json" }
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "errores_importacion.json";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Descargar errores
                  </Button>
                </AccordionContent>
              </AccordionItem>
            )}
        </Accordion>
      )}
    </>
  );
}
