"use client";

import { useEffect, useState } from "react";
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
import { CommonLoader } from "../../components/common/CommonLoader";
import { CertificadoActions } from "./CertificadoForm/CertificadoActions";
import { CertificadoHeaderSummary } from "./CertificadoForm/CertificadoHeaderSummary";

import { useCategorias } from "../hooks/useCategorias";
import { useAgrupaciones } from "../hooks/useAgrupaciones";
import { usePermisosMatriz } from "../hooks/usePermisosMatriz";
import { useCertificadoEdicion } from "../hooks/useCertificadoEdicion";
import { useCertificadoDefaults } from "../hooks/useCertificadoDefaults";
import { EstablecimientoConCircuito } from "./types";

interface CertificadoFormProps {
  mesaId?: number;
  modo: "crear" | "editar";
  onMesaChange?: (mesa: string) => void;
  onEscuelaSeleccionada?: (escuela: EstablecimientoConCircuito) => void;
  onClose?: () => void;
  onSuccess?: () => void;
  onMetadataLoaded?: (data: { seccion: string; circuito: string; mesa: string }) => void;
  escuelaFija?: EstablecimientoConCircuito | null;
}

export default function CertificadoForm({
  mesaId,
  modo,
  onMesaChange,
  onEscuelaSeleccionada,
  onClose,
  onSuccess,
  onMetadataLoaded,
  escuelaFija,
}: CertificadoFormProps) {
  // 1) TODOS los hooks siempre al tope y en el mismo orden
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

  const { categorias, loadingCategorias } = useCategorias();
  const { agrupaciones, loadingAgrupaciones } = useAgrupaciones();
  const { habilitadosPorAgrupacion, loadingPermisos } = usePermisosMatriz({
    ready: !loadingAgrupaciones,
  });

  const { loadingCertificado } = useCertificadoEdicion(
    modo === "editar" && !!mesaId,
    mesaId,
    {
      onData: (data) => form.reset({ ...data, numeroMesa: data.mesa.numero }),
      onMetadataLoaded,
      onEscuelaSeleccionada,
    }
  );

  useCertificadoDefaults(form, modo, agrupaciones, categorias);

  useEffect(() => {
    if (!escuelaFija) return;
    form.setValue("mesa.escuelaId", String(escuelaFija.id));
    form.setValue("mesa.circuitoId", String(escuelaFija.circuito.id));
    form.setValue("mesa.numeroMesa", ""); // forzar a elegir mesa
    onEscuelaSeleccionada?.(escuelaFija);
  }, [escuelaFija, form, onEscuelaSeleccionada]);

  // Hooks de estado ANTES de cualquier return condicional
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmarGuardado, setConfirmarGuardado] = useState(false);

  // Watches
  const votosEspeciales = form.watch("votosEspeciales");
  const resultadosPresidenciales = form.watch("resultadosPresidenciales");
  const sobres = form.watch("totales.sobres");

  // Callback de cambio de mesa
  useEffect(() => {
    const sub = form.watch((value) => {
      if (value.mesa?.numeroMesa) onMesaChange?.(String(value.mesa.numeroMesa));
    });
    return () => sub?.unsubscribe?.();
  }, [form, onMesaChange]);

  // 2) Chequeo de loading (no hay hooks después de este return)
  const isLoading = loadingCategorias || loadingAgrupaciones || loadingCertificado;
  if (isLoading) {
    return (
      <CommonLoader
        logo="/logo.png"
        alternativeLogo="/logo-white.png"
        alternativeText="Más San Miguel"
        title="Votaciones 2025"
        subTitle="San Miguel"
        loaderText="Cargando certificado de escrutinio ..."
      />
    );
  }

  // 3) Lógica normal (sin hooks)
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

  // 4) Render
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <MesaSelector
          control={form.control}
          setValue={form.setValue}
          onEscuelaSeleccionada={onEscuelaSeleccionada}
          disabled={modo === "editar"} 
          fixedEscuela={escuelaFija}
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
          agrupaciones={agrupaciones}
          habilitadosPorAgrupacion={habilitadosPorAgrupacion}
          loadingPermisos={loadingPermisos}
        />
        <Separator />

        <VotosEspecialesForm
          control={form.control}
          categorias={categorias}
        />
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
