import { PrismaClient, User } from "@prisma/client";

declare global {
  var prismaClient: PrismaClient | undefined;
}
