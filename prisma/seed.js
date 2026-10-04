const path = require('path');
const serverModules = path.resolve(__dirname, '../server/node_modules');
const { PrismaClient } = require(path.join(serverModules, '@prisma/client'));
const AdapterFactory = require(path.join(serverModules, '@prisma/adapter-better-sqlite3'));

const configuredUrl = process.env.DATABASE_URL || 'file:./server/dev.db';
const dbPath = path.resolve(__dirname, '..', configuredUrl.replace(/^file:/, ''));
process.env.DATABASE_URL = `file:${dbPath}`;
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'wasm-compiler-edge';

const DatabaseConstructor = require('better-sqlite3');
const db = new DatabaseConstructor(dbPath);
const adapter = new AdapterFactory.PrismaBetterSqlite3(db);
const prisma = new PrismaClient({ adapter });

function localDateAt(daysAgo, hour, minute = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCHours(hour, minute, 0, 0);
  return date;
}

async function main() {
  const userId = 'test-sentinel-user';
  const timezone = 'UTC';
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: 'developer@sentinelos.internal' },
  });

  await prisma.insight.deleteMany({ where: { userId } });
  await prisma.task.deleteMany({ where: { userId } });
  await prisma.checkIn.deleteMany({ where: { userId } });
  await prisma.tag.deleteMany({ where: { userId } });

  const deepWorkTag = await prisma.tag.create({ data: { userId, name: 'deep-work', category: 'TASK_TYPE' } });
  const tasks = [];

  for (let index = 0; index < 8; index += 1) {
    const day = index + 1;
    const failedStart = localDateAt(day, 20);
    tasks.push(await prisma.task.create({
      data: {
        userId,
        type: 'deep work',
        difficulty: 4,
        plannedStart: failedStart,
        timezone,
        localHour: 20,
        localWeekday: ((failedStart.getUTCDay() + 6) % 7) + 1,
        cognitiveLoad: 4,
        plannedMinutes: 90,
        actualStart: failedStart,
        actualMinutes: 45,
        energyAtStart: 2,
        moodAtStart: 3,
        outcome: 'FAIL',
        tags: { create: { tagId: deepWorkTag.id } },
      },
    }));

    const successStart = localDateAt(day + 10, 9);
    tasks.push(await prisma.task.create({
      data: {
        userId,
        type: 'deep work',
        difficulty: 3,
        plannedStart: successStart,
        timezone,
        localHour: 9,
        localWeekday: ((successStart.getUTCDay() + 6) % 7) + 1,
        cognitiveLoad: 3,
        plannedMinutes: 60,
        actualStart: successStart,
        actualMinutes: 60,
        energyAtStart: 8,
        moodAtStart: 8,
        outcome: 'SUCCESS',
        tags: { create: { tagId: deepWorkTag.id } },
      },
    }));
  }

  for (let index = 0; index < 8; index += 1) {
    const monday = new Date();
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7) - index * 7);
    monday.setUTCHours(8, 0, 0, 0);
    await prisma.checkIn.create({
      data: {
        userId,
        kind: 'ENERGY',
        value: 4,
        predictedValue: 9,
        timestamp: monday,
        timezone,
        note: 'synthetic Monday energy overestimate',
      },
    });
  }

  console.log(`Seeded ${tasks.length} tasks: late-night deep-work failures and morning successes.`);
  console.log('Seeded 8 Monday energy check-ins with overestimated predictions.');
  console.log(`Test user: ${user.id}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
