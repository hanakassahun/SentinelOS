import { beforeEach, describe, expect, it, vi } from 'vitest';

const { add, queueCreated, workerCreated, refreshInsights, socketOnce } = vi.hoisted(() => ({
  add: vi.fn(),
  queueCreated: vi.fn(),
  workerCreated: vi.fn(),
  refreshInsights: vi.fn(),
  socketOnce: vi.fn(),
}));

vi.mock('bullmq', () => ({
  Queue: class {
    constructor(name: string, options: unknown) {
      queueCreated(name, options);
    }
    add = add;
    close = vi.fn();
  },
  Worker: class {
    constructor(name: string, processor: unknown, options: unknown) {
      workerCreated(name, processor, options);
    }
    on = vi.fn();
    close = vi.fn();
  },
}));

vi.mock('../../services/insightService', () => ({ refreshInsights }));
vi.mock('node:net', () => ({
  createConnection: vi.fn(() => ({
    once: socketOnce,
    destroy: vi.fn(),
  })),
}));

import { closeInsightQueue, enqueueInsightGeneration, startInsightWorker } from '../../queues/insightQueue';

describe('insight queue modes', () => {
  beforeEach(async () => {
    await closeInsightQueue();
    vi.clearAllMocks();
    socketOnce.mockImplementation((event: string, callback: () => void) => {
      if (event === 'connect') callback();
      return {};
    });
    delete process.env.QUEUE_MODE;
    refreshInsights.mockResolvedValue({});
    add.mockResolvedValue({ id: 'job-1' });
  });

  it('runs inline by default without constructing Redis clients', async () => {
    await expect(enqueueInsightGeneration('user-1')).resolves.toEqual({ queued: false, completed: true });
    expect(refreshInsights).toHaveBeenCalledWith('user-1');
    expect(queueCreated).not.toHaveBeenCalled();
    expect(workerCreated).not.toHaveBeenCalled();
  });

  it('uses bounded Redis settings and propagates enqueue failures immediately', async () => {
    process.env.QUEUE_MODE = 'redis';
    add.mockRejectedValue(new Error('Redis unavailable'));

    await expect(enqueueInsightGeneration('user-1')).rejects.toThrow('Redis unavailable');
    expect(queueCreated).toHaveBeenCalledWith('insight-generation', {
      connection: expect.objectContaining({
        connectTimeout: 3000,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
      }),
    });
  });

  it('starts a Redis worker only when explicitly requested', () => {
    process.env.QUEUE_MODE = 'redis';
    expect(workerCreated).not.toHaveBeenCalled();

    return startInsightWorker().then(() => {
      expect(workerCreated).toHaveBeenCalledWith(
        'insight-generation',
        expect.any(Function),
        { connection: expect.objectContaining({
          connectTimeout: 3000,
          maxRetriesPerRequest: null,
          retryStrategy: expect.any(Function),
        }) },
      );
    });

  });
});