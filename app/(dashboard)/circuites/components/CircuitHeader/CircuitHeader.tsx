"use client"

import { Button } from "@/components/ui/button";
import { DialogContent, DialogTitle, Dialog, DialogHeader, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

import { useState } from "react"

import { Separator } from "@/components/ui/separator";
import { MapPinned } from "lucide-react";
import { FormCircuit } from "../CircuitForm";

interface CircuitHeaderProps {
    onCircuitCreated: () => void;
}

export function CircuitHeader({ onCircuitCreated }: CircuitHeaderProps) {
    const [openModalCreate, setOpenModalCreate] = useState(false);
    return (
        <div className="flex justify-between items-center">
            <h2 className="text-2xl">Listado de Circuitos</h2>
            <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogTrigger asChild>
                    <Button>
                        <MapPinned className="w-4 h-4 mr-2" />
                        Crear Circuito
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <MapPinned className="w-5 h-5 text-primary" />
                            <DialogTitle>Crear Circuito</DialogTitle>
                        </div>
                        <DialogDescription>
                            Crear y configurar un nuevo Circuito
                        </DialogDescription>
                        <Separator />
                    </DialogHeader>

                    <div className="mt-6">
                        <FormCircuit
                            onSuccess={() => {
                                setOpenModalCreate(false);
                                onCircuitCreated();
                            }}
                        />
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    )
}
