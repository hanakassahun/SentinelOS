import { Queue, Worker } from 'bullmq';
import prisma from '../services/prismaClient';
import { calculateTimeBlockSuccess } from '../../intelligence/correlator';

const redisConnection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
};

export const insightQueue = new Queue('insight-generation', {
  connection: redisConnection,
});

const insightWorker = new Worker(
  'insight-generation',
  async (job) => {
    const { userId } = job.data as { userId: string };
    console.log(`Processing performance patterns for User: ${userId}`);

    const insights = await calculateTimeBlockSuccess(userId);
    const highRiskBlocks = insights.filter((insight) => insight.riskFlag);

    for (const block of highRiskBlocks) {
      await prisma.insight.upsert({
        where: {
          id: `${userId}:${block.hourBlock}`,
        },
        update: {
          message: `You underperformed on tasks after ${block.hourBlock}:00. Consider rescheduling.`,
          recommendation: 'Reschedule demanding work to a higher-performing time block.',
          priority: 'medium',
          confidence: block.successRate / 100,
          insights: {
            hourBlock: block.hourBlock,
            successRate: block.successRate,
            totalTasks: block.totalTasks,
          },
          analysis: {
            source: 'rule-based-correlator',
            riskFlag: true,
          },
        },
        create: {
          id: `${userId}:${block.hourBlock}`,
          userId,
          type: 'TIME_OF_DAY',
          message: `You underperformed on tasks after ${block.hourBlock}:00. Consider rescheduling.`,
          recommendation: 'Reschedule demanding work to a higher-performing time block.',
          priority: 'medium',
          confidence: block.successRate / 100,
          insights: {
            hourBlock: block.hourBlock,
            successRate: block.successRate,
            totalTasks: block.totalTasks,
          },
          analysis: {
            source: 'rule-based-correlator',
            riskFlag: true,
          },
        },
      });
    }
  },
  {
    connection: redisConnection,
  },
);

insightWorker.on('ready', () => {
  console.log('Insight queue worker ready');
});

insightWorker.on('failed', (_, err) => {
  console.error('Insight queue worker failed', err);
});
