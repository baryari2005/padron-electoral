import { getCurrentElection } from "./getCurrentElection"

export async function getCurrentElectionId(): Promise<number> {
  const election = await getCurrentElection()
  return election.id
}