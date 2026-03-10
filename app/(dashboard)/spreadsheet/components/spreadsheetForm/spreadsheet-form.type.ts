import { Dispatch, SetStateAction } from "react";

export type FormCreateOrUpdateSpreadsheetProps = {
  setOpenModalCreate: Dispatch<SetStateAction<boolean>>;
  onCreated: () => void;
};