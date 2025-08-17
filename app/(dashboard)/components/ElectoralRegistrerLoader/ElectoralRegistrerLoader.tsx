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

// 👇 shadcn/ui (opcional): Switch y RadioGroup
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { TextStatsLoader } from "./TextStatsLoader";

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

    const formData = new FormData();
    formData.append("file", file);
    // 👇 Enviamos el modo y (opcional) los truncados
    formData.append("mode", mode);
    if (mode === "replace") {
      formData.append("truncateCircuito", String(truncateCircuito));
      formData.append("truncateEstablecimiento", String(truncateEstablecimiento));
      formData.append("truncateMesas", String(truncateMesas));
    }

    setIsUploading(true);
    setRowsImported(null);
    setImportSummary(null);

    const interval = simulateProgress();

    try {
      const res = await axiosInstance.post(
        "/api/electoral-rolls/electoral-rolls-loader",
        formData
      );

      if (res.status !== 200) throw new Error(formatMessage("Error al importar los datos"));

      setProgress(100);
      setRowsImported(res.data?.rows ?? 0);
      setImportSummary({
        rows: res.data?.rows ?? 0,
        establishments: res.data?.establishments ?? 0,
        people: res.data?.people ?? 0,
        circuits: res.data?.circuits ?? 0,
        errors: res.data?.errors ?? 0,
        errorDetails: res.data?.errorDetails ?? [],
      });

      toast.success(
        `¡Importación ${mode === "replace" ? "con truncado" : "agregada"} exitosa! Registros: ${
          res.data?.rows ?? 0
        }`
      );
    } catch (err) {
      console.error("[error]", err);
      toast.error(formatMessage("Error al subir el archivo"));
      setProgress(0);
    } finally {
      clearInterval(interval);
      setIsUploading(false);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

        {/* Flags de truncado sólo si modo = replace */}
        {/* {mode === "replace" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="truncateCircuito">Truncar Circuitos</Label>
              </div>
              <Switch
                id="truncateCircuito"
                checked={truncateCircuito}
                onCheckedChange={setTruncateCircuito}
                disabled={isUploading}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="truncateEstablecimiento">Truncar Establecimientos</Label>
              </div>
              <Switch
                id="truncateEstablecimiento"
                checked={truncateEstablecimiento}
                onCheckedChange={setTruncateEstablecimiento}
                disabled={isUploading}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="truncateMesas">Truncar Mesas</Label>
              </div>
              <Switch
                id="truncateMesas"
                checked={truncateMesas}
                onCheckedChange={setTruncateMesas}
                disabled={isUploading}
              />
            </div>
          </div>
        )} */}

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
          <Separator/>
          <TextStatsLoader/>
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
