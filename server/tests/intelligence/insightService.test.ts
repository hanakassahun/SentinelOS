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
      { id: '1', userId: 'user:1', taskType: 'coding', plannedTime: null, executedTime: new Date(2025, 0, 6, 9, 0), energyLevel: 2, moodLevel: 2, difficulty: 3, outcome: 'fail', createdAt: new Date(2025, 0, 6, 9, 0) },
      { id: '2', userId: 'user:1', taskType: 'coding', plannedTime: null, executedTime: new Date(2025, 0, 6, 9, 15), energyLevel: 2, moodLevel: 2, difficulty: 3, outcome: 'fail', createdAt: new Date(2025, 0, 6, 9, 15) },
      { id: '3', userId: 'user:1', taskType: 'coding', plannedTime: null, executedTime: new Date(2025, 0, 6, 9, 30), energyLevel: 2, moodLevel: 2, difficulty: 3, outcome: 'fail', createdAt: new Date(2025, 0, 6, 9, 30) },
    ]);
    upsert.mockResolvedValue({});
  });

  it('maps database rows and upserts high-risk insights with a stable dedupe id', async () => {
    const first = await refreshInsights('user:1');
    const second = await refreshInsights('user:1');

    expect(first.timeBlocks[9]).toEqual({ hourBlock: 9, successRate: 0, totalTasks: 3, riskFlag: true });
    expect(second.timeBlocks[9]).toEqual(first.timeBlocks[9]);
    expect(first.analysis.totalEvents).toBe(3);
    expect(findMany).toHaveBeenCalledWith({
      where: { userId: 'user:1' },
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: {
        id: true,
        userId: true,
        taskType: true,
        plannedTime: true,
        executedTime: true,
        energyLevel: true,
        moodLevel: true,
        difficulty: true,
        outcome: true,
        createdAt: true,
      },
    });
    expect(upsert).toHaveBeenCalledTimes(4);

    const firstWrite = upsert.mock.calls[0][0];
    const secondWrite = upsert.mock.calls[2][0];
    expect(firstWrite.where.id).toMatch(/^time_of_day-[a-f0-9]{64}$/);
    expect(secondWrite.where.id).toBe(firstWrite.where.id);
    expect(firstWrite.create).toMatchObject({
      userId: 'user:1',
      type: 'TIME_OF_DAY',
      insights: { hourBlock: 9, successRate: 0, totalTasks: 3 },
    });
    expect(upsert.mock.calls[1][0].where.id).toBe(upsert.mock.calls[3][0].where.id);
  });

  it('includes the user in deterministic IDs so users cannot overwrite each other', async () => {
    await refreshInsights('user:1');
    await refreshInsights('user:2');

    expect(upsert.mock.calls[0][0].where.id).not.toBe(upsert.mock.calls[2][0].where.id);
    expect(upsert.mock.calls[1][0].where.id).not.toBe(upsert.mock.calls[3][0].where.id);
  });
});