import { beforeEach, describe, expect, it, vi } from 'vitest';

const { taskFindMany, checkInFindMany, upsert } = vi.hoisted(() => ({
  taskFindMany: vi.fn(),
  checkInFindMany: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock('../../services/prismaClient', () => ({
  default: {
    task: { findMany: taskFindMany },
    checkIn: { findMany: checkInFindMany },
    insight: { upsert },
  },
}));

import { refreshInsights } from '../../services/insightService';

describe('insight refresh service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    taskFindMany.mockImplementation(({ where }: { where: { userId: string } }) => Promise.resolve(
      ([...Array.from({ length: 8 }, (_, index) => ({
        id: `task-${where.userId}-${index}`,
        userId: where.userId,
        type: 'deep work',
        difficulty: 4,
        plannedStart: new Date(Date.UTC(2025, 0, 6 + index, 20, 0)),
        timezone: 'UTC',
        localHour: 20,
        localWeekday: 1,
        cognitiveLoad: 4,
        plannedMinutes: 60,
        actualStart: new Date(Date.UTC(2025, 0, 6 + index, 20, 0)),
        actualMinutes: 45,
        energyAtStart: 2,
        moodAtStart: 2,
        outcome: 'FAIL',
        createdAt: new Date(Date.UTC(2025, 0, 6 + index, 20, 0)),
      })), {
        id: 'pending-task', userId: where.userId, type: 'deep work', difficulty: 3,
        plannedStart: new Date(Date.UTC(2025, 0, 15, 20, 0)), timezone: 'UTC', localHour: 20,
        localWeekday: 3, cognitiveLoad: null, plannedMinutes: null, actualStart: null,
        actualMinutes: null, energyAtStart: null, moodAtStart: null, outcome: null,
        createdAt: new Date(Date.UTC(2025, 0, 15, 20, 0)),
      }]),
    ));
    checkInFindMany.mockResolvedValue(Array.from({ length: 8 }, (_, index) => {
      const timestamp = new Date(2025, 0, 6 + index * 7, 8, 0);
      return {
        id: `checkin-${index}`,
        userId: 'user:1',
        kind: 'ENERGY',
        value: 4,
        predictedValue: 9,
        timestamp,
        timezone: 'America/New_York',
        note: null,
        createdAt: timestamp,
      };
    }));
    upsert.mockResolvedValue({});
  });

  it('drops pending tasks from samples and upserts a stable per-user dedupe key', async () => {
    const first = await refreshInsights('user:1');
    const second = await refreshInsights('user:1');

    expect(first.timeBlocks[20]).toEqual({ hourBlock: 20, successRate: 0, totalTasks: 8, riskFlag: true });
    expect(second.timeBlocks[20]).toEqual(first.timeBlocks[20]);
    expect(first.analysis.totalEvents).toBe(8);
    expect(taskFindMany).toHaveBeenCalledWith({
      where: { userId: 'user:1' },
      orderBy: { plannedStart: 'desc' },
      take: 1000,
      select: expect.objectContaining({ localHour: true, localWeekday: true, outcome: true }),
    });
    expect(checkInFindMany).toHaveBeenCalled();
    expect(upsert).toHaveBeenCalledTimes(4);

    const firstWrite = upsert.mock.calls[0][0];
    const secondWrite = upsert.mock.calls[2][0];
    const mondayWrite = upsert.mock.calls[1][0];
    expect(firstWrite.where.userId_dedupeKey).toEqual({ userId: 'user:1', dedupeKey: 'TIME_OF_DAY:deep work:20' });
    expect(secondWrite.where.userId_dedupeKey).toEqual(firstWrite.where.userId_dedupeKey);
    expect(firstWrite.create).toMatchObject({
      userId: 'user:1',
      type: 'TIME_OF_DAY',
      dedupeKey: 'TIME_OF_DAY:deep work:20',
      sampleSize: 8,
      evidence: { taskType: 'deep work', localHour: 20, failures: 8 },
    });
    expect(firstWrite.update).not.toHaveProperty('status');
    expect(mondayWrite.create).toMatchObject({
      type: 'TREND',
      dedupeKey: 'TREND:ENERGY:MONDAY',
      sampleSize: 8,
      evidence: { localWeekday: 'MONDAY', averageOverestimate: 5 },
    });
    expect(upsert.mock.calls[3][0].where.userId_dedupeKey).toEqual(mondayWrite.where.userId_dedupeKey);
  });

  it('scopes identical dedupe keys by user', async () => {
    await refreshInsights('user:1');
    await refreshInsights('user:2');

    expect(upsert.mock.calls[0][0].where.userId_dedupeKey.userId).not.toBe(upsert.mock.calls[2][0].where.userId_dedupeKey.userId);
    expect(upsert.mock.calls[0][0].where.userId_dedupeKey.dedupeKey).toBe(upsert.mock.calls[2][0].where.userId_dedupeKey.dedupeKey);
  });

  it('recovers both planted late-night failure and Monday energy-overestimate findings', async () => {
    const report = await refreshInsights('user:1');
    const findings = upsert.mock.calls.map((call) => call[0].create);

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ dedupeKey: 'TIME_OF_DAY:deep work:20', sampleSize: 8 }),
      expect.objectContaining({ dedupeKey: 'TREND:ENERGY:MONDAY', sampleSize: 8 }),
    ]));
    expect(report.timeBlocks[20].riskFlag).toBe(true);
    expect(report.timeBlocks[9].successRate).toBe(null);
  });
});