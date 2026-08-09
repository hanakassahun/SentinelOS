export interface ShadowSchedulePoint {
  hour: number;
  label: string;
  riskScore: number;
  evidence: string;
}

export function buildShadowScheduleFromBehavior(events: Array<{ createdAt?: string | Date; outcome?: string | null; energyLevel?: number | null; moodLevel?: number | null }>): ShadowSchedulePoint[] {
  const buckets = new Map<number, { total: number; risk: number; evidence: string[] }>();

  events.forEach((event) => {
    const createdAt = event.createdAt ? new Date(event.createdAt) : new Date();
    const hour = createdAt.getHours();
    const current = buckets.get(hour) ?? { total: 0, risk: 0, evidence: [] };

    current.total += 1;
    current.risk += event.outcome === 'fail' ? 2 : 1;

    if ((event.energyLevel ?? 0) <= 2) {
      current.evidence.push('low energy');
    }
    if ((event.moodLevel ?? 0) <= 2) {
      current.evidence.push('low mood');
    }
    if (event.outcome === 'fail') {
      current.evidence.push('failed execution');
    }

    buckets.set(hour, current);
  });

  return Array.from(buckets.entries())
    .map(([hour, bucket]) => ({
      hour,
      label: `${hour}:00`,
      riskScore: Math.min(100, Math.round((bucket.risk / Math.max(bucket.total, 1)) * 10)),
      evidence: Array.from(new Set(bucket.evidence)).slice(0, 2).join(', '),
    }))
    .sort((a, b) => a.hour - b.hour);
}
