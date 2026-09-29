import { Queue, Worker } from 'bullmq';
import { createConnection } from 'node:net';
import { refreshInsights } from '../services/insightService';

const queueName = 'insight-generation';
const queueMode = () => (process.env.QUEUE_MODE ?? 'inline').toLowerCase();

let insightQueue: Queue | undefined;
let insightWorker: Worker | undefined;

function getQueue(): Queue {
  if (!insightQueue) {
    insightQueue = new Queue(queueName, {
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
        connectTimeout: 3000,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: () => null,
      },
    });
  }
  return insightQueue;
}

function canConnectToRedis(): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
    });
    let settled = false;
    const finish = (connected: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      socket.destroy();
      resolve(connected);
    };
    const timeout = setTimeout(() => finish(false), 1000);
    timeout.unref();
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
  });
}

export async function enqueueInsightGeneration(userId: string): Promise<{ queued: boolean; completed?: boolean }> {
  if (queueMode() !== 'redis') {
    await refreshInsights(userId);
    return { queued: false, completed: true };
  }

  await getQueue().add('generate', { userId });
  return { queued: true };
}

export async function startInsightWorker(): Promise<Worker | undefined> {
  if (queueMode() !== 'redis' || insightWorker) {
    return insightWorker;
  }

  if (!await canConnectToRedis()) {
    console.warn('Insight queue worker not started: Redis is unavailable');
    return undefined;
  }

  insightWorker = new Worker(
    queueName,
    async (job) => {
      const { userId } = job.data as { userId: string };
      await refreshInsights(userId);
    },
    {
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
        connectTimeout: 3000,
        maxRetriesPerRequest: null,
        retryStrategy: (attempt: number) => attempt < 2 ? attempt * 100 : null,
      },
    },
  );

  insightWorker.on('ready', () => console.log('Insight queue worker ready'));
  insightWorker.on('failed', (_job, error) => console.error('Insight queue worker failed', error));
  insightWorker.on('error', (error) => console.error('Insight queue worker error', error));
  return insightWorker;
}

export async function closeInsightQueue(): Promise<void> {
  await Promise.all([
    insightQueue?.close(),
    insightWorker?.close(),
  ]);
  insightQueue = undefined;
  insightWorker = undefined;
}