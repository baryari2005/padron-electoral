import { Company } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";

export type ModalAddEventProps = {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    setOnSaveNewEvent: Dispatch<SetStateAction<boolean>>,
    setNewEvent: Dispatch<SetStateAction<{
        eventName: string,
        companySelected: { name: string, id: string }
    }
    >>,
    companies: Company[],
}