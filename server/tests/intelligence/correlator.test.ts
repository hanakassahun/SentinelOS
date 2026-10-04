import { describe, expect, it } from 'vitest';
import { correlateTimeBlocks } from '../../../intelligence/correlator';
import type { TaskEvent } from '../../../intelligence/types';

const events: TaskEvent[] = [
  { id: '1', userId: 'u', type: 'work', difficulty: 2, plannedStart: '2025-01-06T09:00:00Z', timezone: 'UTC', localHour: 9, localWeekday: 1, outcome: 'FAIL', createdAt: '2025-01-06T09:00:00Z' },
  { id: '2', userId: 'u', type: 'work', difficulty: 2, plannedStart: '2025-01-06T09:15:00Z', timezone: 'UTC', localHour: 9, localWeekday: 1, outcome: 'FAIL', createdAt: '2025-01-06T09:15:00Z' },
  { id: '3', userId: 'u', type: 'work', difficulty: 2, plannedStart: '2025-01-06T09:30:00Z', timezone: 'UTC', localHour: 9, localWeekday: 1, outcome: 'FAIL', createdAt: '2025-01-06T09:30:00Z' },
  { id: '4', userId: 'u', type: 'work', difficulty: 2, plannedStart: '2025-01-06T10:00:00Z', timezone: 'UTC', localHour: 10, localWeekday: 1, outcome: 'SUCCESS', createdAt: '2025-01-06T10:00:00Z' },
  { id: '5', userId: 'u', type: 'work', difficulty: 2, plannedStart: '2025-01-06T10:15:00Z', timezone: 'UTC', localHour: 10, localWeekday: 1, outcome: 'FAIL', createdAt: '2025-01-06T10:15:00Z' },
  { id: '6', userId: 'u', type: 'work', difficulty: 2, plannedStart: '2025-01-06T11:00:00Z', timezone: 'UTC', localHour: 11, localWeekday: 1, outcome: 'SUCCESS', createdAt: '2025-01-06T11:00:00Z' },
  { id: '7', userId: 'u', type: 'work', difficulty: 2, plannedStart: '2025-01-06T12:00:00Z', timezone: 'UTC', localHour: 12, localWeekday: 1, outcome: null, createdAt: '2025-01-06T12:00:00Z' },
];

describe('pure time-block correlation', () => {
  it('returns every hour with deterministic success statistics', () => {
    const blocks = correlateTimeBlocks(events);

    expect(blocks).toHaveLength(24);
    expect(blocks).toMatchSnapshot();
    expect(blocks[9]).toEqual({ hourBlock: 9, successRate: 0, totalTasks: 3, riskFlag: true });
    expect(blocks[10]).toEqual({ hourBlock: 10, successRate: 50, totalTasks: 2, riskFlag: false });
    expect(blocks[11]).toEqual({ hourBlock: 11, successRate: 100, totalTasks: 1, riskFlag: false });
    expect(blocks[12]).toEqual({ hourBlock: 12, successRate: null, totalTasks: 0, riskFlag: false });
  });

  it('does not treat an unobserved hour as perfect performance', () => {
    expect(correlateTimeBlocks([])[0]).toEqual({
      hourBlock: 0,
      successRate: null,
      totalTasks: 0,
      riskFlag: false,
    });
  });
});