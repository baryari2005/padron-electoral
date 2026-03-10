import { prisma } from "@/lib/prisma"

export async function resolveActiveElection() {
  const election = await prisma.eleccion.findFirst({
    where: { activa: true }
  })

  if (!election) {
    throw new Error("No active election")
  }

  if (election.estado !== "ACTIVE") {
    throw new Error("Election is not active")
  }

  return election
}