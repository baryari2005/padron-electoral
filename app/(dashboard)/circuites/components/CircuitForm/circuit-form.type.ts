import { Dispatch, SetStateAction } from "react";

export type FormCreateOrUpdateCircuitProps = {
    setOpenModalCreate: Dispatch<SetStateAction<boolean>>;
    onCreated: () => void;
}