import type { TaskEvent } from '../types';

export function computeSuccessRate(events: TaskEvent[]) {
  const finished = events.filter((event) => event.outcome !== null && event.outcome !== undefined);
  const taskTypes = Array.from(new Set(finished.map((event) => event.type || 'unknown')));
  const stats = taskTypes.map(type => {
    const filtered = finished.filter(e => (e.type || 'unknown') === type);
    const successes = filtered.filter(e => e.outcome === 'SUCCESS').length;
    const failures = filtered.filter(e => e.outcome === 'FAIL').length;
    const total = filtered.length;
    return {
      taskType: type,
      total,
      successes,
      failures,
      successRate: total ? +(successes / total * 100).toFixed(1) : null,
      failureRate: total ? +(failures / total * 100).toFixed(1) : null,
    };
  });

  const blocks = [
    { label: 'Night', start: 0, end: 6 },
    { label: 'Morning', start: 6, end: 12 },
    { label: 'Afternoon', start: 12, end: 17 },
    { label: 'Evening', start: 17, end: 21 },
    { label: 'Late', start: 21, end: 24 },
  ];
  const failureClusters = blocks.map(block => {
    const failures = finished.filter(e => e.outcome === 'FAIL' && e.localHour >= block.start && e.localHour < block.end);
    return {
      label: block.label,
      count: failures.length,
      failures,
    };
  }).filter(cluster => cluster.count > 0);

  const execTimes = finished
    .map((event) => event.actualStart ?? event.plannedStart)
    .map(t => new Date(t).getTime());
  let consistencyScore = null;
  if (execTimes.length > 1) {
    const avg = execTimes.reduce((a, b) => a + b, 0) / execTimes.length;
    const variance = execTimes.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / execTimes.length;
    const stddev = Math.sqrt(variance);
    consistencyScore = +(1 / (1 + stddev / (24 * 60 * 60 * 1000))).toFixed(3);
  }

  return { stats, failureClusters, consistencyScore };
}
