import prisma from '../services/prismaClient';

async function main() {
  try {
    console.log('DATABASE_URL=', process.env.DATABASE_URL);
    const count = await prisma.log.count();
    console.log('Log count:', count);
    const rows = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table';`;
    console.log('Tables:', rows);
  } catch (error) {
    console.error('DEBUG ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
