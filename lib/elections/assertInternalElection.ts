import { getActiveElection } from "./getActiveElection";

export async function assertInternalElection() {
  const election = await getActiveElection();

  if (!election)
    throw new Error("No hay una elección activa actualmente.");

  if (election?.tipo !== "INTERNA") {
    throw new Error("Esta funcionalidad solo está disponible en elecciones internas.");
  }

  return election;
}