import { BehavioralEvent } from '../types';

  // placeholder: compute success rates by time block
  return { summary: 'time analysis placeholder' };
}
export function analyzeByTime(events: BehavioralEvent[]) {
  // Group events by time block (morning, afternoon, evening, night)
  const blocks = [
    { label: 'Night', start: 0, end: 6 },
    { label: 'Morning', start: 6, end: 12 },
    { label: 'Afternoon', start: 12, end: 17 },
    { label: 'Evening', start: 17, end: 21 },
    { label: 'Late', start: 21, end: 24 },
  ];
  const blockStats = blocks.map((block) => {
    const filtered = events.filter(e => {
      const time = e.executedTime || e.plannedTime || e.createdAt;
      const hour = new Date(time).getHours();
      return hour >= block.start && hour < block.end;
    });
    const successes = filtered.filter(e => e.outcome === 'success').length;
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