import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Singleton para evitar múltiples instancias de PrismaClient durante el hot-reload de Next dev.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // libSQL sirve para el archivo local (dev) y para Turso (producción) con el
  // mismo código. En Turso se definen TURSO_DATABASE_URL (libsql://…) y
  // TURSO_AUTH_TOKEN; en local se usa el archivo SQLite (DATABASE_URL).
  const url =
    process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const adapter = new PrismaLibSql({ url, authToken });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
