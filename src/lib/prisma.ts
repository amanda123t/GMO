import { PrismaClient } from "@prisma/client";

// Netlify's Neon extension exposes NETLIFY_DATABASE_URL instead of DATABASE_URL.
// Map to the names Prisma schema expects before instantiating the client.
if (!process.env.DATABASE_URL && process.env.NETLIFY_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.NETLIFY_DATABASE_URL;
}
if (!process.env.DIRECT_URL && process.env.NETLIFY_DATABASE_URL_UNPOOLED) {
  process.env.DIRECT_URL = process.env.NETLIFY_DATABASE_URL_UNPOOLED;
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
