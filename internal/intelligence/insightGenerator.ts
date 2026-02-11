import { calculateAverage, detectTrend, correlate } from '../pattern-engine/analysis';

export function generateInsightsFromLogs(logs: any[]) {
  const values = logs.map((l) => Number(l.value)).filter((v) => !Number.isNaN(v));
  const insights: any[] = [];
  const avg = calculateAverage(values);
  if (avg !== null) {
    insights.push({ type: 'AVERAGE', message: `Average value: ${avg.toFixed(2)}`, value: avg });
  }
  const trend = detectTrend(values);
  insights.push({ type: 'TREND', message: `Trend detected: ${trend}`, trend });

  // placeholder: no additional metrics to correlate with; return basic insights
  return { insights, analysis: { count: values.length, average: avg, trend } };
}

export default { generateInsightsFromLogs };
