"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { FormTextField, SubmitButton } from "@/app/(dashboard)/components/FormsCreate";
import { electionFormSchema, ElectionFormValues } from "../../lib";
import { formatApiMessage, formatMessage } from "@/lib/utils/formatters";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BookLock, BookOpenCheck } from "lucide-react";

interface FormElectionProps {
  election?: {
    id: number;
    nombre: string;
    tipo: string;
    fecha?: Date | null;
    estado: string;
    activa: boolean;
  };
  onSuccess: () => void;
  onClose?: () => void;
}

export function FormElection({ election, onSuccess, onClose }: FormElectionProps) {
  const isEdit = !!election;
  const isLocked = isEdit ? election?.estado !== "DRAFT" : false;

  const form = useForm<ElectionFormValues>({
    resolver: zodResolver(electionFormSchema),
    defaultValues: {
      nombre: election?.nombre || "",
      tipo: election?.tipo === "INTERNA" ? "INTERNA" : "GENERAL",
      fecha: election?.fecha
        ? new Date(election.fecha).toISOString().split("T")[0]
        : "",
    },
    mode: "onChange",
  });

  const { isSubmitting, isValid, isDirty } = form.formState;
  const canSubmit = isValid && !isSubmitting && (!isEdit || isDirty);

  const onSubmit = async (values: ElectionFormValues) => {
    try {
      const payload = {
        ...values,
        fecha: values.fecha ? new Date(values.fecha) : undefined
      }

      if (isEdit) {
        await axiosInstance.put(`/api/elections/${election!.id}`, payload);
        toast.success(formatApiMessage("success.electionUpdated"));
      } else {
        await axiosInstance.post("/api/elections", payload);
        toast.success(formatApiMessage("success.electionCreated"));
      }

      onSuccess();
      onClose?.();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Algo salió mal.";
      toast.error(formatMessage(msg));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormTextField
            control={form.control}
            name="nombre"
            label="Nombre de la Elección"
            placeholder="Ej: INTERNA 2025"
            uppercase
            disabled={isLocked}
          />

          <FormTextField
            control={form.control}
            name="fecha"
            label="Fecha (opcional)"
            type="date"
            disabled={isLocked}
          />
        </div>

        <div>
          <Controller
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLocked}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">GENERAL</SelectItem>
                    <SelectItem value="INTERNA">INTERNA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        </div>

        {isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Estado</Label>
              <div className="p-2 border rounded bg-muted">
                {election.estado}
              </div>
            </div>

            <div>
              <Label>Activa</Label>
              <div className="p-2 border rounded bg-muted">
                {election.activa ? "Sí" : "No"}
              </div>
            </div>
          </div>
        )}

        {!isEdit && (
          <div className="mt-4">
            <SubmitButton
              disabled={!canSubmit || isLocked}
              loading={isSubmitting}
              label={isEdit ? "Actualizar" : "Crear"}
              icon={isEdit ? "pencil" : "plus"}
            />
          </div>
        )}
        {isEdit && (
          <div className="mt-4">
            {election.estado === "DRAFT" && (
              <Button
                type="button"
                onClick={async () => {
                  await axiosInstance.patch(`/api/elections/${election.id}/activate`);
                  toast.success("Elección activada");
                  onSuccess();
                }}
                className="bg-green-600 text-white px-4 w-full my-2"
              >
                <>
                <BookOpenCheck className="w-4 h-4 mr-2"/>
                Activar Elección
                </>
              </Button>
            )}

            {election.estado === "ACTIVE" && (
              <Button
                type="button"
                onClick={async () => {
                  await axiosInstance.patch(`/api/elections/${election.id}/close`);
                  toast.success("Elección cerrada");
                  onSuccess();
                }}
                className="bg-red-600 text-white w-full my-2"
              >
                <>
                <BookLock className="w-4 h-4 mr-2"/>
                Cerrar Elección
                </>
              </Button>
            )}
          </div>
        )}
      </form>
    </Form>
  );
}