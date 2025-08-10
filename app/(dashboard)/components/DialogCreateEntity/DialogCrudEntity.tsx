"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface DialogCrudEntityProps {
  open: boolean;
  setOpen: (open: boolean) => void;  
  titleCreate: string;
  titleUpdate: string;
  description?: string;
  mode: "create" | "update";
  buttonTextCreate: string;
  buttonTextUpdate: string;
  iconButton: ReactNode;
  iconModal: ReactNode;
  children: ReactNode;
}

export function DialogCrudEntity({
  open,
  setOpen,
  iconButton,
  iconModal,  
  titleCreate,
  titleUpdate,
  description,
  mode,
  buttonTextCreate,
  buttonTextUpdate,
  children,
}: DialogCrudEntityProps) {
  const title = mode === "create" ? titleCreate : titleUpdate;
  const buttonText = mode === "create" ? buttonTextCreate : buttonTextUpdate;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          {iconButton}
          <span>{buttonText}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            {iconModal}
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && <DialogDescription>{description}</DialogDescription>}
          <Separator />
        </DialogHeader>
        <div className="mt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
