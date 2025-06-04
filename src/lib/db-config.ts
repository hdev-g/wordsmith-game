import { PrismaClient } from '@prisma/client';

// Automatically set DATABASE_URL based on environment
if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'production') {
    process.env.DATABASE_URL = process.env.PROD_DATABASE_URL;
  } else {
    process.env.DATABASE_URL = process.env.DEV_DATABASE_URL;
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 