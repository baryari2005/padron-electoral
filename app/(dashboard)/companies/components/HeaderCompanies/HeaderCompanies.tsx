"use client"

import { Button } from "@/components/ui/button";
import {  DialogContent, DialogTitle, Dialog, DialogHeader, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

import { useState } from "react"
import { FormCreateCustomer } from "../FormCreateCustomer";

interface HeaderCompaniesProps {
  onCompanyCreated: () => void;
}

export function HeaderCompanies({ onCompanyCreated }: HeaderCompaniesProps) {
    const [openModalCreate, setOpenModalCreate] = useState(false);
    return (
        <div className="flex justify-between items-center">
            <h2 className="text-2xl">List of Companies</h2>
            <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
                <DialogTrigger asChild>
                    <Button>Create Company</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Create Customer</DialogTitle>
                        <DialogDescription>
                            Create and configure your customer
                        </DialogDescription>
                    </DialogHeader>

                    <FormCreateCustomer setOpenModalCreate={setOpenModalCreate}
                                        onCreated={onCompanyCreated}/>
                </DialogContent>
            </Dialog>
        </div>
    )
}
