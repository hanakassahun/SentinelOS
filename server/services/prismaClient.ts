import { PrismaClient } from '@prisma/client';

const url = process.env.DATABASE_URL ?? 'file:server/dev.db';
process.env.DATABASE_URL = url;
process.env.PRISMA_CLIENT_ENGINE_TYPE = process.env.PRISMA_CLIENT_ENGINE_TYPE ?? 'wasm-compiler-edge';
console.log('[prismaClient] DATABASE_URL=', process.env.DATABASE_URL);
console.log('[prismaClient] PRISMA_CLIENT_ENGINE_TYPE=', process.env.PRISMA_CLIENT_ENGINE_TYPE);

const prisma = new PrismaClient();

export default prisma;
