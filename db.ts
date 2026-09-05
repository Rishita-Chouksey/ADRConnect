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

/**
 * Executes a database operation with exponential backoff retry logic.
 * Handles intermittent Supabase pooler connection failures (P1001).
 */
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 300
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      const isConnError =
        error?.code === 'P1001' ||
        error?.code === 'P1002' ||
        error?.message?.includes("Can't reach database server") ||
        error?.message?.includes('EngineConnError') ||
        error?.message?.includes('Closed connection');

      if (isConnError && attempt <= maxRetries) {
        console.warn(`[DB Retry ${attempt}/${maxRetries}] Retrying database operation after connection drop...`);
        await new Promise((res) => setTimeout(res, delayMs * Math.pow(2, attempt - 1)));
      } else {
        throw error;
      }
    }
  }
}
