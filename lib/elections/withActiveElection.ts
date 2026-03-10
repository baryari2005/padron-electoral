import { getActiveElection } from "./getActiveElection"


export async function withActiveElection<T>(
  callback: (electionId: number) => Promise<T>
) {
  const election = await getActiveElection()

  if (!election)
    throw new Error("No existe elección activa.")

  return callback(election!.id)
}