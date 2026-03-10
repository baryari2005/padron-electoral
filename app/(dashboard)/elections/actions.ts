"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

async function requireAdmin() {
  const reqHeaders = headers()
  const authHeader = reqHeaders.get("authorization")

  if (!authHeader) {
    throw new Error("Unauthorized")
  }

  const token = authHeader.replace("Bearer ", "")
  const jwt = await import("jsonwebtoken")

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
    sub: string
    role: string
  }

  if (decoded.role !== "ADMIN") {
    throw new Error("Forbidden")
  }
}

export async function createElection(formData: FormData) {
  await requireAdmin()

  const nombre = formData.get("nombre") as string
  const tipo = formData.get("tipo") as string
  const fechaRaw = formData.get("fecha") as string

  if (!nombre || !tipo) {
    throw new Error("Missing fields")
  }

  await prisma.eleccion.create({
    data: {
      nombre,
      tipo,
      fecha: fechaRaw ? new Date(fechaRaw) : null,
      estado: "DRAFT",
      activa: false
    }
  })

  revalidatePath("/dashboard/elections")
}

export async function activateElection(id: number) {
  await requireAdmin()

  const election = await prisma.eleccion.findUnique({
    where: { id }
  })

  if (!election) {
    throw new Error("Election not found")
  }

  if (election.estado === "CLOSED") {
    throw new Error("Cannot activate closed election")
  }

  await prisma.$transaction([
    prisma.eleccion.updateMany({
      data: { activa: false }
    }),
    prisma.eleccion.update({
      where: { id },
      data: {
        activa: true,
        estado: "ACTIVE"
      }
    })
  ])

  revalidatePath("/dashboard/elections")
}

export async function closeElection(id: number) {
  await requireAdmin()

  await prisma.eleccion.update({
    where: { id },
    data: {
      activa: false,
      estado: "CLOSED"
    }
  })

  revalidatePath("/dashboard/elections")
}