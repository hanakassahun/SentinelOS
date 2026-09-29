import { describe, expect, it } from 'vitest';
import { correlateTimeBlocks } from '../../intelligence/correlator';
import type { TaskEvent } from '../../intelligence/types';

const events: TaskEvent[] = [
  { executedTime: '2025-01-06T09:00:00', outcome: 'fail' },
  { executedTime: '2025-01-06T09:15:00', outcome: 'failed' },
  { executedTime: '2025-01-06T09:30:00', outcome: 'fail' },
  { executedTime: '2025-01-06T10:00:00', outcome: 'success' },
  { executedTime: '2025-01-06T10:15:00', outcome: 'fail' },
  { plannedTime: '2025-01-06T11:00:00', outcome: 'completed' },
  { executedTime: 'not-a-date', outcome: 'success' },
  { outcome: 'success' },
];

describe('pure time-block correlation', () => {
  it('returns every hour with deterministic success statistics', () => {
    const blocks = correlateTimeBlocks(events);

    expect(blocks).toHaveLength(24);
    expect(blocks).toMatchSnapshot();
    expect(blocks[9]).toEqual({ hourBlock: 9, successRate: 0, totalTasks: 3, riskFlag: true });
    expect(blocks[10]).toEqual({ hourBlock: 10, successRate: 50, totalTasks: 2, riskFlag: false });
    expect(blocks[11]).toEqual({ hourBlock: 11, successRate: 100, totalTasks: 1, riskFlag: false });
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