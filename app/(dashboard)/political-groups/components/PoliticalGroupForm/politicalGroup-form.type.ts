import { Dispatch, SetStateAction } from "react";

export type FormCreateOrUpdatePoliticalGroupProps = {
    setOpenModalCreate: Dispatch<SetStateAction<boolean>>;
    onCreated: () => void;
}