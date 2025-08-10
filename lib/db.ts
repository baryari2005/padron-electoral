// lib/db.ts
import { PrismaClient } from "@prisma/client";
import { excludeDeletedMiddleware } from "./prisma/middleware/excludeDeleted";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma ?? new PrismaClient();

// aplicá el middleware una sola vez
prisma.$use(excludeDeletedMiddleware);

// exportá SIEMPRE la misma instancia
export const db = prisma;

// en dev, guardala en global para evitar múltiples conexiones
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}