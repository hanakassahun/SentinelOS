import { Queue, Worker } from 'bullmq';
import { refreshInsights } from '../services/insightService';

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

    await refreshInsights(userId);
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
