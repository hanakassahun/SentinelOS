import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.behavioralEvent.create({
    data: {
      userId: '00000000-0000-0000-0000-000000000000',
      taskType: 'deep_work',
      energyLevel: 4,
      moodLevel: 4,
      difficulty: 3,
      outcome: 'success'
    }
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
