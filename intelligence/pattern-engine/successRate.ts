import { BehavioralEvent } from '../types';

export function computeSuccessRate(events: BehavioralEvent[]) {
  // Compute success/failure rates per task type
  const taskTypes = Array.from(new Set(events.map(e => e.taskType || 'unknown')));
  const stats = taskTypes.map(type => {
    const filtered = events.filter(e => (e.taskType || 'unknown') === type);
    const successes = filtered.filter(e => e.outcome === 'success').length;
    const failures = filtered.filter(e => e.outcome === 'fail').length;
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

  // Failure clustering: group failures by time block
  const blocks = [
    { label: 'Night', start: 0, end: 6 },
    { label: 'Morning', start: 6, end: 12 },
    { label: 'Afternoon', start: 12, end: 17 },
    { label: 'Evening', start: 17, end: 21 },
    { label: 'Late', start: 21, end: 24 },
  ];
  const failureClusters = blocks.map(block => {
    const failures = events.filter(e => {
      if (e.outcome !== 'fail') return false;
      const time = e.executedTime || e.plannedTime || e.createdAt;
      const hour = new Date(time).getHours();
      return hour >= block.start && hour < block.end;
    });
    return {
      label: block.label,
      count: failures.length,
      failures,
    };
  }).filter(cluster => cluster.count > 0);

  // Execution consistency scoring: stddev of execution times
  const execTimes = events
    .map(e => e.executedTime || e.plannedTime)
    .filter(Boolean)
    .map(t => new Date(t).getTime());
  let consistencyScore = null;
  if (execTimes.length > 1) {
    const avg = execTimes.reduce((a, b) => a + b, 0) / execTimes.length;
    const variance = execTimes.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / execTimes.length;
    const stddev = Math.sqrt(variance);
    // Normalize: lower stddev = higher consistency
    consistencyScore = +(1 / (1 + stddev / (24 * 60 * 60 * 1000))).toFixed(3); // 1 day normalization
  }

  return { stats, failureClusters, consistencyScore };
}