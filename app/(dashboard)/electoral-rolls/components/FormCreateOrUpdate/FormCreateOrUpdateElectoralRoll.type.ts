import { PadronElectoral } from "@prisma/client";

export type ElectoralRoll = PadronElectoral;

export interface FormElectoralRollProps {
  padron?: PadronElectoral;
  modo?: "ver" | "editar";
  onSuccess: () => void;
  onClose?: () => void;
  electionType?: string;
}