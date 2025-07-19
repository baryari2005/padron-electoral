"use client"

import { Button } from "@/components/ui/button";
import { DialogContent, DialogTitle, Dialog, DialogHeader, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

import { useState } from "react"

import { Separator } from "@/components/ui/separator";
import { Landmark } from "lucide-react";
import { FormEstablishment } from "../FormCreateOrUpdate";

interface EstablishmentHeaderProps {
    onEstablishmentCreated: () => void;
    circuites: { id: number; nombre: string, codigo: string }[];
    loadingCircuites: boolean;
}

export function EstablishmentHeader({ onEstablishmentCreated, circuites, loadingCircuites }: EstablishmentHeaderProps) {
    const [openModalCreate, setOpenModalCreate] = useState(false);
    return (
        <div className="flex justify-between items-center">
            <h2 className="text-2xl">Listado de Establecimientos</h2>
            <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogTrigger asChild>
                    <Button>
                        <Landmark className="w-4 h-4 mr-2" />
                        Crear Establecimiento
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <Landmark className="w-5 h-5 text-primary" />
                            <DialogTitle>Crear Establecimiento</DialogTitle>
                        </div>
                        <DialogDescription>
                            Crear y configurar un nuevo establecimiento
                        </DialogDescription>
                        <Separator />
                    </DialogHeader>

                    <div className="mt-6">
                        <FormEstablishment
                            onSuccess={() => {
                                setOpenModalCreate(false);
                                onEstablishmentCreated();
                            }}
                            circuites={circuites}
                            loadingCircuites={loadingCircuites}
                        />
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    )
}
