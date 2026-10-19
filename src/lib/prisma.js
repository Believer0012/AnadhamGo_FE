import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const isPrismaConfigured = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);

function getOptimizedDatabaseUrl() {
    const rawUrl = process.env.DATABASE_URL || '';
    if (!rawUrl) return undefined;
    // If connection_limit is not specified in the URL on serverless, clamp to 1 to prevent connection pool exhaustion
    if (!rawUrl.includes('connection_limit=') && !rawUrl.includes('pool_timeout=')) {
        const separator = rawUrl.includes('?') ? '&' : '?';
        return `${rawUrl}${separator}connection_limit=1&pool_timeout=5`;
    }
    return rawUrl;
}

export const prisma =
    globalForPrisma.prisma ||
    (isPrismaConfigured
        ? new PrismaClient({
              datasourceUrl: getOptimizedDatabaseUrl(),
              log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
          })
        : null);

if (process.env.NODE_ENV !== 'production' && prisma) {
    globalForPrisma.prisma = prisma;
}

export default prisma;
