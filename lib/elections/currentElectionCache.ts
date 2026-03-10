import { prisma } from "@/lib/prisma"

let cachedElectionId: number | null = null

export async function getCurrentElectionId(): Promise<number> {
  if (cachedElectionId) {
    return cachedElectionId
  }

  const election = await prisma.eleccion.findFirst({
    where: { activa: true }
  })

  if (!election) {
    throw new Error("No active election found")
  }

  cachedElectionId = election.id

  return election.id
}

export function clearElectionCache() {
  cachedElectionId = null
}