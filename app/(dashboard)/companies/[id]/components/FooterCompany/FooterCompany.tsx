"use client"

import { useRouter } from "next/navigation";
import { FooterCompanyProps } from "./FooterCompany.type";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { title } from "process";
import axios from "axios";

export function FooterCompany(props: FooterCompanyProps) {
    const { companyId } = props;
    const router = useRouter();

    const onDeleteCompany = async () => {
        try {
            axios.delete(`/api/companies/${companyId}`);
            toast("Success", {
                description: "Company deleted!",                
            })            
            router.push("/companies");

        } catch (error) {
            toast("Error", {
                description: "Something went wrong!",
            });
        }
    }

    return (
        <div className="flex justify-end mt-5">
            <Button variant="destructive" onClick={onDeleteCompany}>
                <Trash className="w-4 h-4 mr-2" />
                Remove company
            </Button>
        </div>
    )
}
