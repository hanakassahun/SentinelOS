import { PrismaClient } from '@prisma/client';

const url = process.env.DATABASE_URL ?? 'file:server/dev.db';
process.env.DATABASE_URL = url;
console.log('[prismaClient] DATABASE_URL=', process.env.DATABASE_URL);

const prisma = new PrismaClient();

export default prisma;
