import { calculateAverage, detectTrend, correlate } from '../pattern-engine/analysis';

function weekStartFor(date: Date) {
  const d = new Date(date);
  // align to week starting on Sunday
  const day = d.getDay();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export function generateInsightsFromLogs(logs: any[]) {
  const points = logs
    .map((l) => {
      const ts = l.timestamp || l.time || l.createdAt || l.ts;
      const date = ts ? new Date(ts) : new Date();
      return { value: Number(l.value), date };
    })
    .filter((p) => !Number.isNaN(p.value));

  const values = points.map((p) => p.value);
  const insights: any[] = [];
  const avg = calculateAverage(values);
  if (avg !== null) {
    insights.push({ type: 'AVERAGE', message: `Average value: ${avg.toFixed(2)}`, value: avg });
  }

  const trend = detectTrend(values);
  insights.push({ type: 'TREND', message: `Trend detected: ${trend}`, trend });

  // Build weekly buckets (by calendar week starting Sunday)
  const weeks: Record<string, { start: Date; values: number[] }> = {};
  points.forEach((p) => {
    const start = weekStartFor(p.date);
    const key = start.toISOString().slice(0, 10);
    if (!weeks[key]) weeks[key] = { start, values: [] };
    weeks[key].values.push(p.value);
  });

  // Sort week keys descending (recent first)
  const weekKeys = Object.keys(weeks).sort((a, b) => (a < b ? 1 : -1));

  const weeklyRecommendations: any[] = weekKeys.map((k) => {
    const w = weeks[k];
    const wAvg = calculateAverage(w.values) ?? 0;
    const wTrend = detectTrend(w.values);

    // Recommendation heuristics
    let recommendation = 'Keep your current routine.';
    if (w.values.length < 3) {
      recommendation = 'Not enough data this week to give a strong recommendation.';
    } else if (avg !== null && wAvg < (avg - 1.0)) {
      recommendation = 'This week your energy was below your recent average — prioritize rest and lighter tasks.';
    } else if (avg !== null && wAvg > (avg + 1.0)) {
      recommendation = 'Your energy was above average — schedule demanding tasks while you have momentum.';
    } else if (wTrend === 'downward') {
      recommendation = 'Energy trending down this week — reduce workload and schedule recovery time.';
    } else if (wTrend === 'upward') {
      recommendation = 'Energy trending up — plan important work and maintain healthy habits.';
    }

    return {
      weekStart: w.start.toISOString(),
      count: w.values.length,
      average: Number(wAvg.toFixed(2)),
      trend: wTrend,
      recommendation,
    };
  });

  // Ensure at least one recommendation per recent week (even if empty buckets)
  // (Already produced above for any week with data.)

  // Return combined report
  return { insights, analysis: { count: values.length, average: avg, trend }, weeklyRecommendations };
}

export default { generateInsightsFromLogs };
