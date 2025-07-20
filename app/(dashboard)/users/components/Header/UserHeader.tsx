"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button";
import { DialogContent, DialogTitle, Dialog, DialogHeader, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { UserPlus2 } from "lucide-react";
import { FormUser } from "../FormCreateOrUpdate";

interface UserHeaderProps {
    onUserCreated: () => void;
    roles: { id: number; name: string }[];
    loadingRoles: boolean;
}

export function UserHeader({ onUserCreated, roles, loadingRoles }: UserHeaderProps) {
    const [openModalCreate, setOpenModalCreate] = useState(false);
    return (
        <div className="flex justify-between items-center">
            <h2 className="text-2xl">Listado de Usuarios</h2>
            <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogTrigger asChild>
                    <Button>
                        <UserPlus2 className="w-4 h-4 mr-2" />
                        Crear Usuario
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <UserPlus2 className="w-5 h-5 text-primary" />
                            <DialogTitle>Crear Usuario</DialogTitle>
                        </div>
                        <DialogDescription>
                            Crear y configurar un nuevo usuario
                        </DialogDescription>
                        <Separator />
                    </DialogHeader>

                    <div className="mt-6">
                        <FormUser
                            onSuccess={() => {
                                setOpenModalCreate(false);
                                onUserCreated();
                            }}
                            roles={roles}
                            loadingRoles={loadingRoles}
                        />
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    )
}
