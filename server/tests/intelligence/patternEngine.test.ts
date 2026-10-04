import { describe, expect, it } from 'vitest';
import type { TaskEvent } from '../../../intelligence/types';
import { correlateEnergy } from '../../../intelligence/pattern-engine/energyCorrelation';
import { computeSuccessRate } from '../../../intelligence/pattern-engine/successRate';
import { analyzeByTime } from '../../../intelligence/pattern-engine/timeAnalysis';

const events: TaskEvent[] = [
  { id: 'event-1', userId: 'user-1', type: 'writing', difficulty: 2, plannedStart: '2025-01-06T02:00:00Z', timezone: 'UTC', localHour: 2, localWeekday: 1, energyAtStart: 1, outcome: 'FAIL', createdAt: '2025-01-06T02:00:00Z' },
  { id: 'event-2', userId: 'user-1', type: 'coding', difficulty: 3, plannedStart: '2025-01-06T09:00:00Z', timezone: 'UTC', localHour: 9, localWeekday: 1, energyAtStart: 4, outcome: 'SUCCESS', createdAt: '2025-01-06T09:00:00Z' },
  { id: 'event-3', userId: 'user-1', type: 'coding', difficulty: 3, plannedStart: '2025-01-06T14:00:00Z', timezone: 'UTC', localHour: 14, localWeekday: 1, energyAtStart: 2, outcome: 'FAIL', createdAt: '2025-01-06T14:00:00Z' },
  { id: 'event-4', userId: 'user-1', type: 'writing', difficulty: 2, plannedStart: '2025-01-06T18:00:00Z', timezone: 'UTC', localHour: 18, localWeekday: 1, energyAtStart: 3, outcome: 'SUCCESS', createdAt: '2025-01-06T18:00:00Z' },
  { id: 'event-5', userId: 'user-1', type: 'review', difficulty: 1, plannedStart: '2025-01-06T22:00:00Z', timezone: 'UTC', localHour: 22, localWeekday: 1, energyAtStart: 5, outcome: 'SUCCESS', createdAt: '2025-01-06T22:00:00Z' },
  { id: 'pending', userId: 'user-1', type: 'review', difficulty: 1, plannedStart: '2025-01-06T22:30:00Z', timezone: 'UTC', localHour: 22, localWeekday: 1, energyAtStart: 5, outcome: null, createdAt: '2025-01-06T22:30:00Z' },
];

describe('pattern engine characterization', () => {
  it('computes per-task success rates and failure clusters', () => {
    const result = computeSuccessRate(events);
    expect(result).toMatchSnapshot();
    expect(result.stats.find((stat) => stat.taskType === 'review')?.successRate).toBe(100);
    expect(result.stats.find((stat) => stat.taskType === 'review')?.total).toBe(1);
    expect(result.failureClusters.map((cluster) => cluster.label)).toEqual(['Night', 'Afternoon']);
  });

  it('computes success rates by time block', () => {
    const result = analyzeByTime(events);
    expect(result).toMatchSnapshot();
    expect(result.blockStats.find((block) => block.label === 'Night')?.successRate).toBe(0);
    expect(result.blockStats.find((block) => block.label === 'Morning')?.successRate).toBe(100);
  });

  it('computes the energy and outcome correlation', () => {
    const result = correlateEnergy(events);
    expect(result).toMatchSnapshot();
    expect(result.correlation).toBeGreaterThan(0);
  });
});