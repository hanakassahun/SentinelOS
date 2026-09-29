import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findMany, upsert } = vi.hoisted(() => ({
  findMany: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock('../../services/prismaClient', () => ({
  default: {
    behavioralEvent: { findMany },
    insight: { upsert },
  },
}));

import { refreshInsights } from '../../services/insightService';

describe('insight refresh service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findMany.mockResolvedValue([
      { plannedTime: null, executedTime: new Date(2025, 0, 6, 9, 0), outcome: 'fail' },
      { plannedTime: null, executedTime: new Date(2025, 0, 6, 9, 15), outcome: 'fail' },
      { plannedTime: null, executedTime: new Date(2025, 0, 6, 9, 30), outcome: 'fail' },
    ]);
    upsert.mockResolvedValue({});
  });

  it('maps database rows and upserts high-risk insights with a stable dedupe id', async () => {
    const first = await refreshInsights('user:1');
    const second = await refreshInsights('user:1');

    expect(first[9]).toEqual({ hourBlock: 9, successRate: 0, totalTasks: 3, riskFlag: true });
    expect(second[9]).toEqual(first[9]);
    expect(findMany).toHaveBeenCalledWith({
      where: { userId: 'user:1' },
      select: { plannedTime: true, executedTime: true, outcome: true },
    });
    expect(upsert).toHaveBeenCalledTimes(2);

    const firstWrite = upsert.mock.calls[0][0];
    const secondWrite = upsert.mock.calls[1][0];
    expect(firstWrite.where.id).toMatch(/^time-block-[a-f0-9]{64}$/);
    expect(secondWrite.where.id).toBe(firstWrite.where.id);
    expect(firstWrite.create).toMatchObject({
      userId: 'user:1',
      type: 'TIME_OF_DAY',
      insights: { hourBlock: 9, successRate: 0, totalTasks: 3 },
    });
  });
});