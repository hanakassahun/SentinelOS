import { EnergyAnalysis } from './energyAnalyzer';

export type InsightType = 'AVERAGE' | 'TREND' | 'TIME_OF_DAY' | 'SUDDEN_DROP';

export type InsightPriority = 'high' | 'medium' | 'low';

export interface Insight {
  type: InsightType;
  priority: InsightPriority;
  message: string;
  recommendation?: string;
  score?: number;
  data?: any;
}

export function generateEnergyInsights(analysis: EnergyAnalysis): Insight[] {
  const insights: Insight[] = [];
  if (analysis.totalLogs < 5) return insights; // require minimum logs

  // 1. Average baseline (LOW priority generally)
  if (analysis.weeklyAverage !== undefined) {
    let interpretation = 'stable';
    if (analysis.weeklyAverage < 4) interpretation = 'low';
    else if (analysis.weeklyAverage > 7) interpretation = 'high';

    const msg = interpretation === 'stable'
      ? 'Your energy is stable this week.'
      : interpretation === 'low'
      ? "Your energy is lower than usual this week."
      : 'Your energy is higher than usual this week.';

    insights.push({
      type: 'AVERAGE',
      priority: 'low',
      message: msg,
      recommendation: analysis.weeklyAverage < 5 ? 'Consider lightening your schedule.' : 'Keep leveraging your current routine.',
      score: 0.4,
      data: { weeklyAverage: analysis.weeklyAverage },
    });
  }

  // 2. Trend detection (MEDIUM priority)
  if (analysis.trendPercent !== undefined) {
    const pct = analysis.trendPercent;
    if (Math.abs(pct) >= 5) {
      const dir = pct > 0 ? 'upward' : 'downward';
      insights.push({
        type: 'TREND',
        priority: 'medium',
        message: `Your energy is trending ${dir} (${pct}% change).`,
        recommendation: pct < 0 ? 'Prioritize rest and reduce intense tasks.' : 'Keep the momentum and schedule important tasks.',
        score: Math.min(0.9, Math.abs(pct) / 100 + 0.6),
        data: { trendPercent: pct },
      });
    }
  }

  // 3. Time-of-day pattern (MEDIUM priority)
  if (analysis.peakPeriod && analysis.peakPeriod.count > 1) {
    insights.push({
      type: 'TIME_OF_DAY',
      priority: 'medium',
      message: `Your highest average energy is during ${analysis.peakPeriod.label}.`,
      recommendation: `Schedule demanding tasks during ${analysis.peakPeriod.label.toLowerCase()}.`,
      score: 0.6,
      data: analysis.peakPeriod,
    });
  }

  // 4. Sudden drop (HIGH priority)
  if (analysis.suddenDrop) {
    insights.push({
      type: 'SUDDEN_DROP',
      priority: 'high',
      message: `Your energy is significantly lower today (${analysis.suddenDrop.percent}% lower than usual).`,
      recommendation: 'Take a short break and reassess priorities.',
      score: 0.99,
      data: analysis.suddenDrop,
    });
  }

  // Prevent insight spam: if only low-priority insights exist, return no insights
  const hasHighOrMedium = insights.some((i) => i.priority === 'high' || i.priority === 'medium');
  if (!hasHighOrMedium) return [];

  // Sort by priority (high > medium > low) then score
  const priorityRank: Record<InsightPriority, number> = { high: 3, medium: 2, low: 1 };
  insights.sort((a, b) => {
    const p = priorityRank[b.priority] - priorityRank[a.priority];
    if (p !== 0) return p;
    return (b.score || 0) - (a.score || 0);
  });

  return insights.slice(0, 3);
}
