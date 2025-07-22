"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { FormTextField, SubmitButton } from "@/app/(dashboard)/components/FormsCreate";
import { formSchema, FormValues } from "../../lib";



interface FormRoleProps {
  role?: {
    id: number;
    name: string
  };
  onSuccess: () => void;
  onClose?: () => void;
}

export function FormRole({ role, onSuccess, onClose }: FormRoleProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role?.name || "",
    },
    mode: "onChange",
  });
  const isEdit = !!role;
  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {        
        await axiosInstance.put(`/api/roles/${role.id}`, values);
        toast.success("Rol actualizado correctamente");
      } else {       
        await axiosInstance.post("/api/roles", values);
        toast.success("Rol creado correctamente");
      }

      onSuccess();
      onClose?.();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Algo salió mal.";
      toast.error(msg);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormTextField
            control={form.control}
            name="name"
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
