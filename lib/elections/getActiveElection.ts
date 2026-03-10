import { db } from "@/lib/db"

export async function getActiveElection() {
  return db.eleccion.findFirst({
    where: {
      estado: "ACTIVE",
    },
  });
}