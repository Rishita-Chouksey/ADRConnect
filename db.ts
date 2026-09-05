import { PrismaClient } from '@prisma/client';

/**
 * Next.js dev mode hot-reloads modules on every file save, which would
 * otherwise create a new PrismaClient (and a new DB connection pool) on
 * every reload. Stashing the instance on `globalThis` in development
 * keeps a single client alive across reloads. In production, a fresh
 * client is created once per server instance, as normal.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
