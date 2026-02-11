import { PrismaClient } from '@prisma/client';

const url = process.env.DATABASE_URL ?? 'file:server/dev.db';
process.env.DATABASE_URL = url;
process.env.PRISMA_CLIENT_ENGINE_TYPE = process.env.PRISMA_CLIENT_ENGINE_TYPE ?? 'wasm-compiler-edge';
console.log('[prismaClient] DATABASE_URL=', process.env.DATABASE_URL);
console.log('[prismaClient] PRISMA_CLIENT_ENGINE_TYPE=', process.env.PRISMA_CLIENT_ENGINE_TYPE);

// Create an adapter instance expected by Prisma v7's client constructor
const AdapterFactory = require('@prisma/adapter-better-sqlite3');
const adapterInstance = new AdapterFactory.PrismaBetterSqlite3({ url }, {});

const prisma = new PrismaClient({ adapter: adapterInstance });

export default prisma;
