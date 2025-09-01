// src/features/users/hooks/useCanSubmitUser.ts
import { useMemo } from "react";

export function useCanSubmitUser({
  isSubmitting,
  isValid,
  requiereEscuela,
  escuelasLoaded,
  escuelasIdsLength
}: {
  isSubmitting: boolean;
  isValid: boolean;
  requiereEscuela: boolean;
  escuelasLoaded: boolean;
  escuelasIdsLength: number;
}) {
  return useMemo(() => {
    if (isSubmitting) return false;
    if (!isValid) return false;
    if (requiereEscuela && escuelasIdsLength === 0) return false;
    if (requiereEscuela && !escuelasLoaded) return false;
    return true;
  }, [isSubmitting, isValid, requiereEscuela, escuelasLoaded, escuelasIdsLength]);
}
