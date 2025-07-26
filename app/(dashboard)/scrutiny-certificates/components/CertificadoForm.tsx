"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { certificadoSchema, CertificadoFormData } from "../utils/schema";
import { Separator } from "@/components/ui/separator";

import { AgrupacionPolitica } from "@prisma/client";
import {
  ResultadosPresidencialesForm,
  VotosEspecialesForm,
  TotalesForm,
  MesaSelector,
  ResumenValidacionTotalesPorColumna,
} from "@/app/(dashboard)/scrutiny-certificates/components";
import { EstablecimientoConCircuito } from "./types";
import { ReceiptText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useRef } from "react";

interface CertificadoFormProps {
  mesaId?: number; // solo en modo edición
  modo: "crear" | "editar";
  onMesaChange?: (mesa: string) => void;
  onEscuelaSeleccionada?: (escuela: EstablecimientoConCircuito) => void;
  onClose?: () => void;
  onSuccess?: () => void;
  onMetadataLoaded?: (data: { seccion: string; circuito: string, mesa: string; }) => void;
}

export default function CertificadoForm({
  mesaId,
  modo,
  onMesaChange,
  onEscuelaSeleccionada,
  onClose,
  onSuccess,
  onMetadataLoaded }: CertificadoFormProps) {
  const [agrupaciones, setAgrupaciones] = useState<AgrupacionPolitica[]>([]);
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmarGuardado, setConfirmarGuardado] = useState(false);

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

  const handleTrySubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      console.log("Errores:", form.formState.errors);
      return;
    }

    if (hayInconsistencias) {
      setConfirmarGuardado(true);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  const alreadyFetched = useRef(false);
  useEffect(() => {
    const fetchCertificado = async () => {
      if (alreadyFetched.current) return;
      if (modo === "editar" && mesaId) {
        alreadyFetched.current = true;
        try {
          const res = await axiosInstance.get(`/api/scrutiny-certificates/${mesaId}`);
          const data = res.data;

          form.reset({
            ...data,
          });

          // 👇 Notificás al padre
          onMetadataLoaded?.({
            seccion: "53 - SAN MIGUEL",
            circuito: data.mesa.circuitoId,
            mesa: data.mesa.numeroMesa
          });
        } catch (error) {
          toast.error("Error al cargar datos del certificado.");
          console.error(error);
        }
      }
    };

    fetchCertificado();
  }, [mesaId, modo]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axiosInstance.get("/api/categories?all=true");
        setCategorias(res.data.items);
      } catch {
        toast.error("Error al cargar categorías.");
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchAgrupaciones = async () => {
      try {
        const res = await axiosInstance.get("/api/political-groups?all=true");
        setAgrupaciones(res.data.items);
      } catch {
        toast.error("Error al cargar agrupaciones políticas.");
      } finally {
        setLoading(false);
      }
    };
    fetchAgrupaciones();
  }, []);

  useEffect(() => {
    if (modo === "editar") return;

    if (!loading && agrupaciones.length > 0 && categorias.length > 0) {
      form.reset({
        ...form.getValues(),
        votosEspeciales: categorias.reduce((acc, cat) => {
          acc[cat.id] = {
            nulos: 0,
            blancos: 0,
            recurridos: 0,
            impugnados: 0,
            comandoElectoral: 0,
          };
          return acc;
        }, {} as CertificadoFormData["votosEspeciales"]),
        resultadosPresidenciales: agrupaciones.map((a) => {
          const base: any = {
            id: a.id,
            nombre: a.nombre,
            numero: a.numero,
            profileImage: a.profileImage ?? "",
          };
          categorias.forEach((cat) => {
            base[cat.id] = 0;
          });
          return base;
        }),
      });
    }
  }, [agrupaciones, categorias, loading]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.mesa?.numeroMesa) {
        onMesaChange?.(String(value.mesa.numeroMesa));
      }
    });
    return () => subscription?.unsubscribe?.();
  }, [form.watch, onMesaChange]);

  const onSubmit = async (data: CertificadoFormData) => {
    setIsSubmitting(true);
    try {
      if (modo === "editar" && mesaId) {
        await axiosInstance.put(`/api/scrutiny-certificates/${mesaId}`, data);
        toast.success("Certificado actualizado con éxito");
      }
      else {
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

        <div className="text-sm font-medium italic text-center text-muted-foreground px-4">
          CERTIFICO: en mi carácter de presidente de esta mesa, de acuerdo con lo establecido en los arts. 102 y 102 bis del Código Electoral Nacional que el escrutinio arrojó los siguientes resultados
        </div>
        <Separator />

        {!loading && (
          <ResultadosPresidencialesForm
            control={form.control}
            resultadosPresidenciales={form.getValues().resultadosPresidenciales}
            categorias={categorias}
          />
        )}
        <Separator />

        <VotosEspecialesForm control={form.control} categorias={categorias} />
        <Separator />

        <div className="text-sm font-medium italic text-center text-muted-foreground px-4">
          (*) La suma de los totales por columna deberá coincidir con la cantidad de sobres utilizados en la urna
        </div>
        <Separator />

        <ResumenValidacionTotalesPorColumna control={form.control} categorias={categorias} />
        <Separator />

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleTrySubmit}
            disabled={isSubmitting}
            className={`h-12 px-6 text-base ${hayInconsistencias ? "bg-red-600 hover:bg-red-700" : ""}`}
          >
            <ReceiptText className="w-5 h-5 mr-2" />
            {isSubmitting ? "Guardando..." : "Guardar certificado"}
          </Button>
        </div>
      </form>

      <AlertDialog open={confirmarGuardado} onOpenChange={setConfirmarGuardado}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hay diferencias en los totales</AlertDialogTitle>
            <AlertDialogDescription>
              Se detectaron inconsistencias entre los sobres cargados y la suma total de votos por columna.
              ¿Estás seguro de que querés guardar el certificado de todos modos?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setConfirmarGuardado(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmarGuardado(false);
                form.handleSubmit(onSubmit)();
              }}
            >
              Confirmar guardado
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
