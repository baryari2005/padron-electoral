"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Check } from "lucide-react";

import { ElectoralRollFormValues, electoralRollSchema } from "../../lib";
import { FormElectoralRollProps } from "./FormCreateOrUpdateElectoralRoll.type";

import { PersonalDataSection } from "./sections/PersonalDataSection";
import { AddressSection } from "./sections/AddressSection";
import { MesaVotoSection } from "./sections/MesaVotoSection";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { SubmitButton } from "@/app/(dashboard)/components/FormsCreate";

export function FormCreateOrUpdateElectoralRoll({
  padron,
  onSuccess,
  onClose,
}: FormElectoralRollProps) {
  const isEdit = !!padron;
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ElectoralRollFormValues>({
    resolver: zodResolver(electoralRollSchema),
    defaultValues: padron
      ? {
        ...padron,
        genero: padron.genero as "M" | "F" | "X", // conversión segura
      }
      : {
        distrito: "BUENOS AIRES",
        tipo_ejemplar: "DNI-EA",
        numero_matricula: "",
        apellido: "",
        nombre: "",
        clase: new Date().getFullYear() - 16,
        genero: "M", // o el que quieras por defecto
        domicilio: "",
        seccion: "53 - SAN MIGUEL",
        circuitoId: 0,
        localidad: "",
        codigo_postal: "",
        tipo_nacionalidad: "ARGENTINA",
        numero_mesa: 1,
        orden_mesa: 1,
        establecimientoId: 0,
        voto_sino: "SI",
      },
  });

  const { control } = form;
  const { isSubmitting } = form.formState;

  const watch = useWatch({ control: form.control });

  const isDatosCompletos =
    !!watch.numero_matricula && !!watch.apellido && !!watch.nombre;
  const isDomicilioCompleto =
    !!watch.domicilio && !!watch.localidad && !!watch.circuitoId;
  const isMesaCompleta =
    !!watch.numero_mesa && !!watch.voto_sino && !!watch.distrito;

  const onSubmit = async (values: ElectoralRollFormValues) => {
    try {
      if (padron) {
        await axiosInstance.put(`/api/electoral-rolls/${padron.id}`, values);
        toast.success("Registro actualizado correctamente");
      } else {
        await axiosInstance.post("/api/electoral-rolls", values);
        toast.success("Registro creado correctamente");
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
          </TabsList>

          <Separator className="mb-6" />

          <TabsContent value="datos">
            <PersonalDataSection control={form.control} isEdit={isEdit} />
          </TabsContent>

          <TabsContent value="domicilio">
            <AddressSection control={form.control} />
          </TabsContent>

          <TabsContent value="mesa">
            <MesaVotoSection control={form.control} />
          </TabsContent>
        </Tabs>

        <div className="mt-4">
          <SubmitButton
            loading={isSubmitting || isUploading}
            label={isEdit ? "Actualizar" : "Crear"}
            icon={isEdit ? "pencil" : "plus"}
          />
        </div>

      </form>
    </Form>
  );
}
