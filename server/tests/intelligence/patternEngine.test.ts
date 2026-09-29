import { describe, expect, it } from 'vitest';
import type { BehavioralEvent } from '../../../intelligence/types';
import { correlateEnergy } from '../../../intelligence/pattern-engine/energyCorrelation';
import { computeSuccessRate } from '../../../intelligence/pattern-engine/successRate';
import { analyzeByTime } from '../../../intelligence/pattern-engine/timeAnalysis';

const events: BehavioralEvent[] = [
  {
    id: 'event-1',
    userId: 'user-1',
    taskType: 'writing',
    executedTime: '2025-01-06T02:00:00',
    energyLevel: 1,
    outcome: 'fail',
    createdAt: '2025-01-06T02:00:00',
  },
  {
    id: 'event-2',
    userId: 'user-1',
    taskType: 'coding',
    executedTime: '2025-01-06T09:00:00',
    energyLevel: 4,
    outcome: 'success',
    createdAt: '2025-01-06T09:00:00',
  },
  {
    id: 'event-3',
    userId: 'user-1',
    taskType: 'coding',
    executedTime: '2025-01-06T14:00:00',
    energyLevel: 2,
    outcome: 'fail',
    createdAt: '2025-01-06T14:00:00',
  },
  {
    id: 'event-4',
    userId: 'user-1',
    taskType: 'writing',
    executedTime: '2025-01-06T18:00:00',
    energyLevel: 3,
    outcome: 'success',
    createdAt: '2025-01-06T18:00:00',
  },
  {
    id: 'event-5',
    userId: 'user-1',
    taskType: 'review',
    executedTime: '2025-01-06T22:00:00',
    energyLevel: 5,
    outcome: 'success',
    createdAt: '2025-01-06T22:00:00',
  },
];

describe('pattern engine characterization', () => {
  it('computes per-task success rates and failure clusters', () => {
    const result = computeSuccessRate(events);
    expect(result).toMatchSnapshot();
    expect(result.stats.find((stat) => stat.taskType === 'review')?.successRate).toBe(100);
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