"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { FormTextField, SubmitButton } from "@/app/(dashboard)/components/FormsCreate";
import { spreadsheetFormSchema, SpreadsheetFormValues } from "../../lib";
import { formatApiMessage, formatMessage } from "@/lib/utils/formatters";


interface FormSpreadsheetProps {
  spreadsheet?: {
    id: number;
    numero?: number;          // viene del GET
    nombre?: string | null;
  };
  modo?: "ver" | "editar";
  onSuccess: () => void;
  onClose?: () => void;
}

export function FormSpreadsheet({
  spreadsheet,
  modo = "editar",
  onSuccess,
  onClose,
}: FormSpreadsheetProps) {
  const isEdit = !!spreadsheet;

  const isReadOnly = modo === "ver";

  const form = useForm<SpreadsheetFormValues>({
    resolver: zodResolver(spreadsheetFormSchema),
    defaultValues: {
      nombre: spreadsheet?.nombre || "",
      numero: spreadsheet?.numero,
    },
    mode: "onChange",
  });

  const { isSubmitting, isValid, isDirty } = form.formState;
  const canSubmit = isValid && !isSubmitting && isDirty;

  const onSubmit = async (values: SpreadsheetFormValues) => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/api/spreadsheet/${spreadsheet!.id}`, values);
      } else {
        await axiosInstance.post("/api/spreadsheet", values);
        toast.success(formatApiMessage("success.spreadsheetCreated"));
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
            name="numero"
            label="Número / Código de Planilla"
            placeholder="Ej: 13"
            disabled={!!spreadsheet || isReadOnly}            
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormTextField
            control={form.control}
            name="nombre"
            label="Nombre de Planilla"
            placeholder="Ej: PLANILLA MESA 13"
            disabled={isReadOnly}
            uppercase
          />
        </div>

        {!isReadOnly && (
          <div className="mt-4">
            <SubmitButton
              disabled={!canSubmit}
              loading={isSubmitting}
              label={isEdit ? "Actualizar" : "Crear"}
              icon={isEdit ? "pencil" : "plus"}
            />
          </div>
        )}
      </form>
    </Form>
  );
}