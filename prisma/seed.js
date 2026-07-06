const { PrismaClient, BehaviorType } = require('@prisma/client');
const path = require('path');

const dbPath = path.resolve('./server/dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'wasm-compiler-edge';

// Create an adapter instance expected by Prisma v7's client constructor
const AdapterFactory = require('@prisma/adapter-better-sqlite3');
const DatabaseConstructor = require('better-sqlite3');

const db = new DatabaseConstructor(dbPath);
const adapter = new AdapterFactory.PrismaBetterSqlite3(db);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting behavioral pattern seeding...');

  // 1. Clean up any existing test data to ensure a fresh state
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM "DecisionLog";`);
    await prisma.$executeRawUnsafe(`DELETE FROM "Insight";`);
    await prisma.$executeRawUnsafe(`DELETE FROM "LogTag";`);
    await prisma.$executeRawUnsafe(`DELETE FROM "Log";`);
    await prisma.$executeRawUnsafe(`DELETE FROM "BehavioralEvent";`);
    await prisma.$executeRawUnsafe(`DELETE FROM "Decision";`);
    await prisma.$executeRawUnsafe(`DELETE FROM "User";`);
    console.log('✓ Database cleaned');
  } catch (e) {
    console.log('✓ Database clean (first run)');
  }

  // 2. Create our primary test user
  const user = await prisma.user.create({
    data: {
      id: 'test-sentinel-user',
      email: 'developer@sentinelos.internal',
    },
  });

  console.log(`✓ Created test user: ${user.id}`);

  // 3. Inject a 3-day history of a user burning out late at night
  const targetDays = [2, 1, 0]; // 2 days ago, 1 day ago, today

  for (const daysAgo of targetDays) {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - daysAgo);

    // Set time to 9:00 PM (21:00) to simulate late-night pushing
    const nightTime = new Date(baseDate);
    nightTime.setHours(21, 0, 0, 0);

    console.log(`\n📅 Seeding data for ${nightTime.toISOString()}`);

    // A. Log a low energy state at night
    await prisma.log.create({
      data: {
        userId: user.id,
        behaviorType: 'ENERGY',
        value: 2, // Extremely low energy (out of 10)
        expectedValue: 7,
        outcome: 'failed',
        timestamp: nightTime,
        note: 'Feeling completely drained after a long day.',
      },
    });
    console.log(`  ✓ Energy log: 2/10 at ${nightTime.toLocaleTimeString()}`);

    // B. Log a highly difficult behavioral event scheduled during that low energy window
    await prisma.behavioralEvent.create({
      data: {
        userId: user.id,
        taskType: 'Deep Work / Complex Architecture',
        plannedTime: nightTime,
        executedTime: nightTime,
        energyLevel: 2,
        moodLevel: 3,
        difficulty: 9, // Highly demanding task
        outcome: 'ABANDONED',
        createdAt: nightTime,
      },
    });
    console.log(`  ✓ Behavioral event: Deep Work abandoned (difficulty: 9/10)`);

    // C. Log a matching high-risk decision made under fatigue
    await prisma.decision.create({
      data: {
        userId: user.id,
        description: 'Decided to refactor the core authentication engine while exhausted.',
        tags: 'coding,fatigue,high-risk',
        riskScore: 85,
        riskLevel: 'HIGH',
        explanation: 'Attempting core rewrites at 2 out of 10 energy levels.',
        createdAt: nightTime,
      },
    });
    console.log(`  ✓ Decision logged: High-risk architecture task (risk: 85/100)`);

    // D. Add a decision log tracking the outcome
    await prisma.decisionLog.create({
      data: {
        userId: user.id,
        action: 'ATTEMPTED_CRITICAL_REFACTOR',
        context: {
          energyLevel: 2,
          timeOfDay: 'night',
          taskType: 'architecture',
        },
        outcome: 'ABANDONED_DUE_TO_FATIGUE',
        productivityDrop: 45,
        createdAt: nightTime,
      },
    });
    console.log(`  ✓ Decision log: 45% productivity drop recorded`);
  }

  // 4. Add some "good days" for comparison (morning with high energy)
  console.log(`\n📅 Adding comparison data (morning with high energy)`);
  for (let i = 0; i < 2; i++) {
    const goodDate = new Date();
    goodDate.setDate(goodDate.getDate() - (5 + i)); // 5-6 days ago

    const morningTime = new Date(goodDate);
    morningTime.setHours(9, 0, 0, 0);

    // Log high energy in the morning
    await prisma.log.create({
      data: {
        userId: user.id,
        behaviorType: 'ENERGY',
        value: 9,
        expectedValue: 8,
        outcome: 'success',
        timestamp: morningTime,
        note: 'Fresh and ready to tackle the day.',
      },
    });

    // Log successful behavioral event
    await prisma.behavioralEvent.create({
      data: {
        userId: user.id,
        taskType: 'Deep Work / Complex Architecture',
        plannedTime: morningTime,
        executedTime: morningTime,
        energyLevel: 9,
        moodLevel: 8,
        difficulty: 8,
        outcome: 'COMPLETED',
        createdAt: morningTime,
      },
    });

    // Log low-risk decision
    await prisma.decision.create({
      data: {
        userId: user.id,
        description: 'Planned incremental refactoring session with clear milestones.',
        tags: 'coding,strategic,well-planned',
        riskScore: 25,
        riskLevel: 'LOW',
        explanation: 'Well-rested with clear objectives and time constraints.',
        createdAt: morningTime,
      },
    });

    console.log(`  ✓ Morning success pattern added (${morningTime.toISOString()})`);
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`\n📊 Test User Details:`);
  console.log(`   • User ID: ${user.id}`);
  console.log(`   • Email: ${user.email}`);
  console.log(`   • Data: 3 bad days (late night, low energy, high risk)`);
  console.log(`   • Data: 2 good days (morning, high energy, low risk)`);
  console.log(`\n🚀 Ready to test! Call:`);
  console.log(`   GET http://localhost:5000/api/analytics/${user.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
