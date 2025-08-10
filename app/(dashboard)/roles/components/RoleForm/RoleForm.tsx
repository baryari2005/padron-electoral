"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { FormTextField, SubmitButton } from "@/app/(dashboard)/components/FormsCreate";
import { formSchema, FormValues } from "../../lib";
import { formatApiMessage, formatMessage } from "@/lib/utils/formatters";

interface FormRolProps {
  role?: {
    id: number;
    nombre: string
  };
  onSuccess: () => void;
  onClose?: () => void;
}

export function FormRole({ role, onSuccess, onClose }: FormRolProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: role?.nombre || "",
    },
    mode: "onChange",
  });
  const isEdit = !!role;
  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (values: FormValues) => {    
    try {
      if (isEdit) {        
        await axiosInstance.put(`/api/roles/${role.id}`, values);        
      } else {       
        await axiosInstance.post("/api/roles", values);
        toast.success(formatApiMessage("success.roleCreated"));
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
            label="Nombre del Rol"
            placeholder="Ej: ADMINISTRADOR"
            uppercase
          />
        </div>

        <div className="mt-4">
          <SubmitButton
            loading={isSubmitting}
            label={role ? "Actualizar" : "Crear"}
            icon={role ? "pencil" : "plus"}
          />
        </div>
      </form>
    </Form>
  );
}
