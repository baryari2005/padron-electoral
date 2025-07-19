"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { FormContact } from "./FormContact";

interface NewContactProps{
    companyId: string,
    onContactCreated: (contact: any) => void;
}

export function NewContact({ companyId, onContactCreated }: NewContactProps) {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add New contact</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Add new contact</DialogTitle>
                    <DialogDescription>
                        Create your contacts to manage them later.
                    </DialogDescription>
                </DialogHeader>
                <FormContact setOpen={setOpen} companyId={companyId} onContactCreated={onContactCreated}/>
            </DialogContent>
        </Dialog>
    )
}
