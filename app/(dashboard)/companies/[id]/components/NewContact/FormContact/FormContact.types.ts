import { Dispatch, SetStateAction } from "react"

export type FormContactProps = {
    setOpen: Dispatch<SetStateAction<boolean>>;
    companyId: string;
    onContactCreated: (contact: any) => void;
};