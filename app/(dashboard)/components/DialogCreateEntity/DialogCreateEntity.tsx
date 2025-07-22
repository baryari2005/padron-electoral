// components/DialogCreateEntity.tsx
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

interface DialogCreateEntityProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  icon: ReactNode;
  title: string;
  description?: string;
  buttonText: string;
  children: ReactNode;
}

export function DialogCreateEntity({
  open,
  setOpen,
  icon,
  title,
  description,
  buttonText,
  children,
}: DialogCreateEntityProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          {icon}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            {icon}
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
