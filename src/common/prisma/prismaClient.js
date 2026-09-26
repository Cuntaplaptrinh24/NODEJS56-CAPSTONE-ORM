import { PrismaClient } from "@prisma/client";

// Singleton: cache tren global de khong tao nhieu PrismaClient khi
// hot-reload (local) hoac dong lap lai serverless invocation (Vercel).
const globalForPrisma = globalThis;
const prisma =
  globalForPrisma.__prismaClient ??
  new PrismaClient({ log: ["warn", "error"] });

if (globalForPrisma.__prismaClient === undefined) {
  globalForPrisma.__prismaClient = prisma;
}

export default prisma;
