import { Dispatch, SetStateAction } from "react";

export type FormCreateOrUpdateElectionProps = {
  setOpenModalCreate: Dispatch<SetStateAction<boolean>>;
  onCreated: () => void;
};