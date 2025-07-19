"use client"

import { Button } from "@/components/ui/button";
import { DialogContent, DialogTitle, Dialog, DialogHeader, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

import { useState } from "react"

import { Separator } from "@/components/ui/separator";
import { BookUser } from "lucide-react";
import { FormPoliticalGroup } from "../PoliticalGroupForm";

interface PoliticalGroupHeaderProps {
    onPoliticalGroupCreated: () => void;
}

export function PoliticalGroupHeader({ onPoliticalGroupCreated }: PoliticalGroupHeaderProps) {
    const [openModalCreate, setOpenModalCreate] = useState(false);
    return (
        <div className="flex justify-between items-center">
            <h2 className="text-2xl">Listado de Agrupación Política</h2>
            <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogTrigger asChild>
                    <Button>
                        <BookUser className="w-4 h-4 mr-2" />
                        Crear Agrupación Política
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <BookUser className="w-5 h-5 text-primary" />
                            <DialogTitle>Crear Agrupación Política</DialogTitle>
                        </div>
                        <DialogDescription>
                            Crear y configurar una nueva Agrupación Política
                        </DialogDescription>
                        <Separator />
                    </DialogHeader>

                    <div className="mt-6">
                        <FormPoliticalGroup
                            onSuccess={() => {
                                setOpenModalCreate(false);
                                onPoliticalGroupCreated();
                            }}
                        />
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    )
}
