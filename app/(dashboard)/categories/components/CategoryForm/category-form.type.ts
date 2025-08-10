import { Dispatch, SetStateAction } from "react";

export type FormCreateOrUpdateCategoryProps = {
    setOpenModalCreate: Dispatch<SetStateAction<boolean>>;
    onCreated: () => void;
}