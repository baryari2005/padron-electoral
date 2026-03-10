// 🧩 Archivo: components/CertificadoForm/CertificadoActions.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Loader2, ReceiptText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { UseFormReturn } from "react-hook-form";
import { CertificadoFormData } from "../../utils/schema";

interface CertificadoActionsProps {
  form: UseFormReturn<CertificadoFormData>;
  hayInconsistencias: boolean;
  isSubmitting: boolean;
  confirmarGuardado: boolean;
  setConfirmarGuardado: (v: boolean) => void;
  onSubmit: (data: CertificadoFormData) => void;
}

export function CertificadoActions({
  form,
  hayInconsistencias,
  isSubmitting,
  confirmarGuardado,
  setConfirmarGuardado,
  onSubmit,
}: CertificadoActionsProps) {
  const handleTrySubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    if (hayInconsistencias) {
      setConfirmarGuardado(true);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleTrySubmit}
          disabled={isSubmitting}
          className={`h-12 px-6 text-base ${hayInconsistencias ? "bg-red-600 hover:bg-red-700" : ""
            }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="animate-pulse">Guardando...</span>
            </>
          ) : (
            <>
              <ReceiptText className="w-5 h-5" />
              Guardar certificados
            </>
          )}
        </Button>
      </div>

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
    </>
  );
}  
