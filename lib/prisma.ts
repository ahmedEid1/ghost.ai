import { PrismaClient } from "../app/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// pg v8 treats sslmode=require/prefer/verify-ca as verify-full but emits a
// deprecation warning. Explicitly rewrite to verify-full to silence it.
function normalizeSslMode(url: string): string {
  return url.replace(/sslmode=(prefer|require|verify-ca)/g, "sslmode=verify-full");
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";

  if (url.startsWith("prisma+postgres://")) {
    return new PrismaClient({
      accelerateUrl: url,
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  }

  const adapter = new PrismaPg({ connectionString: normalizeSslMode(url) });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
