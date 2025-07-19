"use client"

import { Button } from "@/components/ui/button";
import { DialogContent, DialogTitle, Dialog, DialogHeader, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

import { useState } from "react"
import { FormRole } from "../FormCreateOrUpdate";
import { Separator } from "@/components/ui/separator";
import { ShieldUser } from "lucide-react";

interface RolesHeaderProps {
    onRoleCreated: () => void;
}

export function RolesHeader({ onRoleCreated }: RolesHeaderProps) {
    const [openModalCreate, setOpenModalCreate] = useState(false);
    return (
        <div className="flex justify-between items-center">
            <h2 className="text-2xl">Listado de Roles</h2>
            <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogTrigger asChild>
                    <Button>
                        <ShieldUser className="w-4 h-4 mr-2" />
                        Crear Rol
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <ShieldUser className="w-5 h-5 text-primary" />
                            <DialogTitle>Crear Rol</DialogTitle>
                        </div>
                        <DialogDescription>
                            Crear y configurar un nuevo Rol
                        </DialogDescription>
                        <Separator />
                    </DialogHeader>

                    <div className="mt-6">
                        <FormRole
                            onSuccess={() => {
                                setOpenModalCreate(false);
                                onRoleCreated();
                            }}
                        />
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    )
}
