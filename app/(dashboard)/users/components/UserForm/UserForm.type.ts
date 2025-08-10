import { Dispatch, SetStateAction } from "react";
import { Usuario } from "@prisma/client"; // o el tipo correcto que estés usando

export type FormCreateOrUpdateUserProps = {
  setOpenModalCreate: Dispatch<SetStateAction<boolean>>;
  onCreated: () => void;
  user?: Usuario; // <- este campo lo usás cuando hacés una edición
};