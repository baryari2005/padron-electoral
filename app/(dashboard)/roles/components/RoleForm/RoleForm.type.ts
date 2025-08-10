import { Dispatch, SetStateAction } from "react";

export type FormCreateOrUpdateRoleProps = {
    setOpenModalCreate: Dispatch<SetStateAction<boolean>>;
    onCreated: () => void;
}