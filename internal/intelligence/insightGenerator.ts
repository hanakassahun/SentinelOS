import { calculateAverage, detectTrend, correlate } from '../pattern-engine/analysis';
import { analyzeEnergy } from '../../intelligence/energyAnalyzer';

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

  const report: any = { insights, analysis: { count: values.length, average: avg, trend }, weeklyRecommendations };

  // If these look like energy-style numeric logs (1-10), produce explainable guidance
  const looksLikeEnergy = values.length > 0 && values.every((v) => typeof v === 'number' && v >= 0 && v <= 10);
  if (looksLikeEnergy) {
    try {
      const energyLogs = logs.map((l) => ({ value: Number(l.value), timestamp: l.timestamp || l.time || l.createdAt || l.ts }));
      const ea = analyzeEnergy(energyLogs);
      const guidance: Array<{ message: string; recommendation?: string }> = [];

      if (ea.peakPeriod) {
        const pct = ea.weeklyAverage ? Math.round(((ea.peakPeriod.avg - (ea.weeklyAverage || 0)) / (ea.weeklyAverage || 1)) * 100) : 0;
        const whenPhraseMap: Record<string, string> = {
          Night: 'at night',
          Morning: 'before noon',
          Afternoon: 'in the afternoon',
          Evening: 'in the evening',
          Late: 'late at night',
        };
        const when = whenPhraseMap[ea.peakPeriod.label] || `during ${ea.peakPeriod.label}`;
        const msg = `Your highest average energy is ${ea.peakPeriod.avg} (${ea.peakPeriod.count} reports) ${when}.`;
        const rec = pct > 10 ? `You are about ${Math.abs(pct)}% ${ea.peakPeriod.avg > (ea.weeklyAverage || 0) ? 'more' : 'less'} energetic ${when} compared to your weekly average — schedule demanding tasks ${when}.` : `Consider scheduling demanding tasks ${when} when possible.`;
        guidance.push({ message: msg, recommendation: rec });
      }

      if (ea.suddenDrop) {
        guidance.push({
          message: `Today's average energy is down ${ea.suddenDrop.percent}% compared to your weekly average.`,
          recommendation: 'Take it easier today: postpone high-effort tasks and prioritize rest or short focused sessions.',
        });
      }

      if (ea.trendPercent !== undefined && Math.abs(ea.trendPercent) >= 10) {
        const dir = ea.trendPercent > 0 ? 'increasing' : 'decreasing';
        guidance.push({
          message: `Your recent energy is ${dir} (${Math.abs(ea.trendPercent)}% change).`,
          recommendation: ea.trendPercent > 0 ? 'Leverage this momentum for important work.' : 'Consider reducing load and scheduling recovery time.',
        });
      }

      if (guidance.length) report.explainableGuidance = guidance;
    } catch (e) {
      // non-fatal: don't break insight generation
    }
  }

  return report;
}

export default { generateInsightsFromLogs };
