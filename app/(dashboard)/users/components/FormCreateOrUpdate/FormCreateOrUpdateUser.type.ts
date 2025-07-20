import { Dispatch, SetStateAction } from "react";
import { User } from "@prisma/client"; // o el tipo correcto que estés usando

export type FormCreateOrUpdateUserProps = {
  setOpenModalCreate: Dispatch<SetStateAction<boolean>>;
  onCreated: () => void;
  user?: User; // <- este campo lo usás cuando hacés una edición
};