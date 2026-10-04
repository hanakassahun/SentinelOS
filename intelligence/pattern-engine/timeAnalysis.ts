import type { TaskEvent } from '../types';

export function analyzeByTime(events: TaskEvent[]) {
  const blocks = [
    { label: 'Night', start: 0, end: 6 },
    { label: 'Morning', start: 6, end: 12 },
    { label: 'Afternoon', start: 12, end: 17 },
    { label: 'Evening', start: 17, end: 21 },
    { label: 'Late', start: 21, end: 24 },
  ];
  const blockStats = blocks.map((block) => {
    const filtered = events.filter(e => e.outcome !== null && e.outcome !== undefined && e.localHour >= block.start && e.localHour < block.end);
    const successes = filtered.filter(e => e.outcome === 'SUCCESS').length;
    const total = filtered.length;
    return {
      label: block.label,
      total,
      successes,
      successRate: total ? +(successes / total * 100).toFixed(1) : null,
    };
  });
  return { blockStats };
}
