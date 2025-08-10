import { PrismaClient } from '@prisma/client';
import { excludeDeletedMiddleware } from './prisma/middleware/excludeDeleted';

declare global {
  // Prevent multiple instances of Prisma Client in development
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}
const prisma = globalThis.prisma ?? new PrismaClient();

// ✅ Aplicar middleware para ignorar registros con deletedAt
prisma.$use(excludeDeletedMiddleware);

export const db = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;