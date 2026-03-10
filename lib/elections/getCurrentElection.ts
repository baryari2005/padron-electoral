import { prisma } from "@/lib/prisma"

export async function getCurrentElection() {
  const election = await prisma.eleccion.findFirst({
    where: { activa: true }
  })

  if (!election) {
    throw new Error("No active election found")
  }

  return election
}