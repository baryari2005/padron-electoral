"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import axiosInstance from "@/utils/axios";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface TableActionsProps {
  id: string;
  editUrl: string;
  deleteUrl: string;
  onDeleted?: (id: string) => void;

  resourceName?: string; // default: 'registro'
  confirmTitle?: string; // default: '¿Eliminar registro?'
  confirmDescription?: string; // default: 'Esta acción no se puede deshacer.'
  confirmActionLabel?: string; // default: 'Eliminar'
}

export const TableActions = ({
  id,
  editUrl,
  deleteUrl,
  onDeleted,
  resourceName = "registro",
  confirmTitle = "¿Eliminar registro?",
  confirmDescription = "Esta acción no se puede deshacer.",
  confirmActionLabel = "Eliminar",
}: TableActionsProps) => {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(deleteUrl);
      if (res.status === 200) {
        toast.success(`${resourceName} eliminado correctamente`);
        if (onDeleted) onDeleted(id);
      } else {
        toast.error("Algo salió mal.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || `Error al eliminar ${resourceName}`;
      toast.error(msg);
    } finally {
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-8 h-4 p-0">
            <span className="sr-only">Open Menu</span>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <Link href={editUrl}>
            <DropdownMenuItem>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
          </Link>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem>
              <Trash2 className="w-4 h-4 mr-2" />
              {confirmActionLabel}
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>{confirmActionLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
