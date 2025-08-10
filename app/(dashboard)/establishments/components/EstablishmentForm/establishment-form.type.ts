import { Dispatch, SetStateAction } from "react";

export type FormCreateOrUpdateUserProps = {
    setOpenModalCreate: Dispatch<SetStateAction<boolean>>;
    onCreated: () => void;
}