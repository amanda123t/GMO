import { PrismaClient } from "@prisma/client";

// Map platform-specific env var names to the names Prisma schema expects.
// Priority: DATABASE_URL (manually set) > platform-injected variants.
//
// Vercel + Neon integration  → DATABASE_URL_UNPOOLED  (direct)
// Vercel Postgres (legacy)   → POSTGRES_PRISMA_URL    (pooled) / POSTGRES_URL_NON_POOLING (direct)
// Netlify + Neon extension   → NETLIFY_DATABASE_URL   (pooled) / NETLIFY_DATABASE_URL_UNPOOLED (direct)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ??
    process.env.NETLIFY_DATABASE_URL ??
    "";
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL =
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.NETLIFY_DATABASE_URL_UNPOOLED ??
    process.env.DATABASE_URL; // fallback to pooled if no direct URL configured
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
