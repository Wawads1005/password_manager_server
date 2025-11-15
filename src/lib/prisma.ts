import { PrismaClient } from "@prisma/client";
import { keys } from "./keys";

const prismaClient = globalThis.prismaClient ?? new PrismaClient();

if (keys.environment !== "production") {
  globalThis.prismaClient = prismaClient;
}

export { prismaClient };
