"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { certificadoSchema, CertificadoFormData } from "../utils/schema";

import {
  ResultadosPresidencialesForm,
  VotosEspecialesForm,
  TotalesForm,
  MesaSelector,
  ResumenValidacionTotalesPorColumna,
} from "@/app/(dashboard)/scrutiny-certificates/components";

import { AgrupacionPolitica } from "@prisma/client";
import { EstablecimientoConCircuito } from "./types";
import { CertificadoLoader } from "./CertificadoForm/CertificadoLoader";
import { buildDefaultVotosEspeciales, buildResultadosPresidenciales } from "./helpers";
import { CertificadoActions } from "./CertificadoForm/CertificadoActions";
import { CertificadoHeaderSummary } from "./CertificadoForm/CertificadoHeaderSummary";
import { formatApiMessage } from "@/lib/utils/formatters";

interface CertificadoFormProps {
  mesaId?: number;
  modo: "crear" | "editar";
  onMesaChange?: (mesa: string) => void;
  onEscuelaSeleccionada?: (escuela: EstablecimientoConCircuito) => void;
  onClose?: () => void;
  onSuccess?: () => void;
  onMetadataLoaded?: (data: { seccion: string; circuito: string; mesa: string }) => void;
}

export default function CertificadoForm({
  mesaId,
  modo,
  onMesaChange,
  onEscuelaSeleccionada,
  onClose,
  onSuccess,
  onMetadataLoaded,
}: CertificadoFormProps) {
  const [agrupaciones, setAgrupaciones] = useState<AgrupacionPolitica[]>([]);
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingAgrupaciones, setLoadingAgrupaciones] = useState(true);
  const [loadingCertificado, setLoadingCertificado] = useState(() => modo === "editar" && mesaId !== undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmarGuardado, setConfirmarGuardado] = useState(false);
  const formReset = useRef(false);

  const form = useForm<CertificadoFormData>({
    resolver: zodResolver(certificadoSchema),
    defaultValues: {
      mesa: { escuelaId: "", numeroMesa: "", circuitoId: "" },
      votosEspeciales: {},
      totales: { sobres: 0, votantes: 0, diferencia: 0 },
      resultadosPresidenciales: [],
    },
    mode: "onChange",
  });

  const votosEspeciales = form.watch("votosEspeciales");
  const resultadosPresidenciales = form.watch("resultadosPresidenciales");
  const sobres = form.watch("totales.sobres");

    // 🔁 Carga inicial de categorías
  useEffect(() => {
    axiosInstance
      .get("/api/categories?all=true")
      .then((res) => {
        const items = res.data?.items ?? [];
        console.log("📦 Categorías recibidas", items);
        setCategorias(items);
      })
      .catch((err) => {
        console.error("❌ Error al cargar categorías", err);
        toast.error(formatApiMessage("errors.categoryBadRequest"));
      })
      .finally(() => setLoadingCategorias(false));
  }, []);

  // 🔁 Carga inicial de agrupaciones
  useEffect(() => {
    axiosInstance
      .get("/api/political-groups?all=true")
      .then((res) => {
        const items = res.data?.items ?? [];
        console.log("📦 Agrupaciones recibidas", items);
        setAgrupaciones(items);
      })
      .catch((err) => {
        console.error("❌ Error al cargar agrupaciones", err);
        toast.error(formatApiMessage("errors.politicalGroupBadRequest"));
      })
      .finally(() => setLoadingAgrupaciones(false));
  }, []);

  // 🔁 Carga del certificado si está en modo edición
  useEffect(() => {
    if (modo !== "editar" || !mesaId) {
      setLoadingCertificado(false);
      return;
    }

    (async () => {
      try {
        const res = await axiosInstance.get(`/api/scrutiny-certificates/${mesaId}`);
        const data = res.data;
        console.log("📦 Certificado recibido", data);

        form.reset({ ...data, numeroMesa: data.mesa.numero });
        onMetadataLoaded?.({
          seccion: "53 - SAN MIGUEL",
          circuito: data.mesa.circuitoId,
          mesa: data.mesa.numeroMesa,
        });

        const escuelaId = data.mesa.escuelaId;
        if (escuelaId) {
          const res = await axiosInstance.get(`/api/establishments/${escuelaId}`);
          onEscuelaSeleccionada?.(res.data);
        }
      } catch (err) {
        console.error("❌ Error al cargar certificado", err);
        toast.error(formatApiMessage("errors.certificateBadRequest"));
      } finally {
        setLoadingCertificado(false);
      }
    })();
  }, [mesaId, modo]);

  // 🔁 Preconfiguración por defecto en modo crear
  useEffect(() => {
    if (!formReset.current && modo === "crear" && agrupaciones.length > 0 && categorias.length > 0) {
      form.reset({
        ...form.getValues(),
        votosEspeciales: buildDefaultVotosEspeciales(categorias),
        resultadosPresidenciales: buildResultadosPresidenciales(agrupaciones, categorias),
      });
      formReset.current = true;
    }
  }, [agrupaciones, categorias, modo]);

  // 🔁 Callback al cambiar la mesa seleccionada
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.mesa?.numeroMesa) onMesaChange?.(String(value.mesa.numeroMesa));
    });
    return () => subscription?.unsubscribe?.();
  }, [form.watch, onMesaChange]);

  const isLoading = loadingCategorias || loadingAgrupaciones || loadingCertificado;
  console.log("🌀 Estado de carga:", { loadingCategorias, loadingAgrupaciones, loadingCertificado, isLoading });

  if (isLoading) return <CertificadoLoader />;

  // 🔎 Validación de inconsistencias
  const hayInconsistencias = categorias.some((cat) => {
    const especiales = Object.values(votosEspeciales?.[cat.id] || {}).reduce(
      (acc: number, val: any) => acc + (Number(val) || 0),
      0
    );
    const presidenciales = resultadosPresidenciales?.reduce(
      (acc: number, curr: any) => acc + (Number(curr?.[cat.id]) || 0),
      0
    );
    return especiales + presidenciales !== sobres;
  });

  const onSubmit = async (data: CertificadoFormData) => {
    setIsSubmitting(true);
    try {
      if (modo === "editar" && mesaId) {
        await axiosInstance.put(`/api/scrutiny-certificates/${mesaId}`, data);
        toast.success("Certificado actualizado con éxito");
      } else {
        await axiosInstance.post("/api/scrutiny-certificates", data);
        toast.success("Certificado guardado con éxito.");
      }
      form.reset();
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Error al guardar el certificado.";
      toast.error(msg);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <MesaSelector
          control={form.control}
          setValue={form.setValue}
          onEscuelaSeleccionada={onEscuelaSeleccionada}
          disabled={modo === "editar"}
        />
        <Separator />

        <TotalesForm control={form.control} setValue={form.setValue} />
        <Separator />

        <CertificadoHeaderSummary />
        <Separator />

        <ResultadosPresidencialesForm
          control={form.control}
          resultadosPresidenciales={form.getValues().resultadosPresidenciales}
          categorias={categorias}
        />
        <Separator />

        <VotosEspecialesForm control={form.control} categorias={categorias} />
        <Separator />

        <ResumenValidacionTotalesPorColumna control={form.control} categorias={categorias} />
        <Separator />
        
        <div className="text-sm font-medium italic text-center text-muted-foreground px-4">
          (*) La suma de los totales por columna deberá coincidir con la cantidad de sobres utilizados en la urna
        </div>
        <Separator />


        <CertificadoActions
          form={form}
          hayInconsistencias={hayInconsistencias}
          isSubmitting={isSubmitting}
          confirmarGuardado={confirmarGuardado}
          setConfirmarGuardado={setConfirmarGuardado}
          onSubmit={onSubmit}
        />
      </form>
    </Form>
  );
}
