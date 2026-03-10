"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { Check } from "lucide-react";

import { ElectoralRollFormValues, electoralRollSchema } from "../../lib";
import { FormElectoralRollProps } from "./FormCreateOrUpdateElectoralRoll.type";

import { AddressSection, MesaVotoSection, PersonalDataSection } from "./sections";

import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { SubmitButton } from "@/app/(dashboard)/components/FormsCreate";
import { formatApiMessage } from "@/lib/utils/formatters";
import { AsignacionesSection } from "./sections/AsignacionesSection";

export function FormCreateOrUpdateElectoralRoll({
  padron,
  modo = "editar",
  onSuccess,
  onClose,
  electionType,
}: FormElectoralRollProps) {
  const isReadOnly = modo === "ver";
  const isEdit = !!padron;
  const [isUploading, setIsUploading] = useState(false);
  const isInterna = electionType?.toUpperCase() === "INTERNA";

  const form = useForm<ElectoralRollFormValues>({
    resolver: zodResolver(electoralRollSchema),
    defaultValues: padron
      ? {
        distrito: padron.distrito,
        tipoEjemplar: padron.tipoEjemplar,
        numeroMatricula: padron.numeroMatricula,
        apellido: padron.apellido,
        nombre: padron.nombre,
        clase: padron.clase,
        genero: padron.genero as "M" | "F" | "X",
        domicilio: padron.domicilio,
        seccion: padron.seccion,
        circuitoId: padron.circuitoId,
        localidad: padron.localidad,
        codigoPostal: padron.codigoPostal,
        tipoNacionalidad: padron.tipoNacionalidad,
        numeroMesa: padron.numeroMesa,
        ordenMesa: padron.ordenMesa,
        establecimientoId: padron.establecimientoId,
        telefono: padron.telefono ?? "",
        votoSiNo: padron.votoSiNo as "S" | "N",

        referenteId: padron.referenteId ?? undefined,
        planilleroId: padron.planilleroId ?? undefined,
        choferId: padron.choferId ?? undefined,
        planillaId: padron.planillaId ?? undefined,
      }
      : {
        distrito: "BUENOS AIRES",
        tipoEjemplar: "DNI-EA",
        numeroMatricula: "",
        apellido: "",
        nombre: "",
        clase: new Date().getFullYear() - 16,
        genero: "M",
        domicilio: "",
        seccion: "53 - San Miguel 2025",
        circuitoId: 0,
        localidad: "",
        codigoPostal: "",
        tipoNacionalidad: "ARGENTINA",
        numeroMesa: 1,
        ordenMesa: 1,
        establecimientoId: 0,
        telefono: "",
        votoSiNo: "S",

        referenteId: undefined,
        planilleroId: undefined,
        choferId: undefined,
        planillaId: undefined,
      }
  });

  const { control } = form;
  const { isSubmitting } = form.formState;

  const watch = useWatch({ control: form.control });

  const isDatosCompletos =
    !!watch.numeroMatricula && !!watch.apellido && !!watch.nombre;
  const isDomicilioCompleto =
    !!watch.domicilio && !!watch.localidad && !!watch.circuitoId;
  const isMesaCompleta =
    !!watch.numeroMesa && !!watch.votoSiNo && !!watch.distrito;
  const isDataTypeComplite =
    !!watch.referenteId && !!watch.planilleroId && !!watch.choferId;
    //  && !!watch.planillaId;

  const onSubmit = async (values: ElectoralRollFormValues) => {
    try {
      const payload = {
        ...values,
        votoSiNo: values.votoSiNo === "S" ? "S" : "N",
      };

      if (padron) {
        await axiosInstance.put(`/api/electoral-rolls/${padron.id}`, payload);
        toast.success(formatApiMessage("success.electoral-rollsUpdated"));
      } else {
        await axiosInstance.post("/api/electoral-rolls", payload);
        toast.success(formatApiMessage("success.electoral-rollsCreated"));
      }

      onSuccess();
      onClose?.();
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Error al guardar el registro";
      toast.error(msg);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="datos">
          <TabsList className="w-full justify-start gap-2 mb-6 border-b">
            <TabsTrigger
              value="datos"
              className="data-[state=active]:border-b-2 data-[state=active]:text-primary rounded-none px-2 py-1"
            >
              Datos personales
              {isDatosCompletos && <Check className="ml-1 w-4 h-4 text-green-600" />}
            </TabsTrigger>

            <TabsTrigger
              value="domicilio"
              className="data-[state=active]:border-b-2 data-[state=active]:text-primary rounded-none px-2 py-1"
            >
              Domicilio
              {isDomicilioCompleto && <Check className="ml-1 w-4 h-4 text-green-600" />}
            </TabsTrigger>

            <TabsTrigger
              value="mesa"
              className="data-[state=active]:border-b-2 data-[state=active]:text-primary rounded-none px-2 py-1"
            >
              Mesa y voto
              {isMesaCompleta && <Check className="ml-1 w-4 h-4 text-green-600" />}
            </TabsTrigger>
            {isInterna && (
              <TabsTrigger
                value="asignaciones"
                className="data-[state=active]:border-b-2 data-[state=active]:text-primary rounded-none px-2 py-1"
              >
                Asignaciones
                {isDataTypeComplite && <Check className="ml-1 w-4 h-4 text-green-600" />}
              </TabsTrigger>
            )}
          </TabsList>

          <Separator className="mb-6" />

          <TabsContent value="datos">
            <PersonalDataSection control={form.control} isEdit={isEdit} modo={modo} />
          </TabsContent>

          <TabsContent value="domicilio">
            <AddressSection control={form.control} modo={modo} />
          </TabsContent>

          <TabsContent value="mesa">
            <MesaVotoSection control={form.control} modo={modo} />
          </TabsContent>

          {isInterna && (
            <TabsContent value="asignaciones">
              <AsignacionesSection control={form.control} modo={modo} />
            </TabsContent>
          )}
        </Tabs>
        {!isReadOnly && (
          <div className="mt-4">
            <SubmitButton
              loading={isSubmitting || isUploading}
              label={isEdit ? "Actualizar" : "Crear"}
              icon={isEdit ? "pencil" : "plus"}
            />
          </div>
        )}

      </form>
    </Form>
  );
}
