import prisma from '../services/prismaClient';
const uuidv4 = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);

async function seed() {
  try {
    const now = new Date();
    // create a test user
    const user = await prisma.user.create({ data: { id: uuidv4(), email: 'test+seed@example.com' } });
    for (let i = 0; i < 10; i++) {
      await prisma.log.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          behaviorType: 'ENERGY',
          value: Math.floor(Math.random() * 10) + 1,
          expectedValue: null,
          timestamp: new Date(now.getTime() - i * 3600 * 1000),
          timezone: 'UTC',
          note: 'seed',
        },
      });
    }
    console.log('Inserted sample logs');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
