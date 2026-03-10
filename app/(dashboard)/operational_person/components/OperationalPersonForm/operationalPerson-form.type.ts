import { Dispatch, SetStateAction } from "react";

export type FormCreateOrUpdateOperationalPersonProps = {
    setOpenModalCreate: Dispatch<SetStateAction<boolean>>;
    onCreated: () => void;
}