/**
 * Behavioral Pattern Analysis Engine
 * 
 * Analyzes user behavioral events to identify:
 * - Task type success/failure patterns
 * - Time-of-day performance variations
 * - Energy and mood correlations with outcomes
 * - Execution consistency and planning accuracy
 * - High-performing and problematic periods
 */

import type { TaskEvent } from '../types';
import { groupBy, getTimeBlock, computeMetrics, AggregatedMetrics } from './dataAggregator';

export interface TaskTypeStats {
  taskType: string;
  totalAttempts: number;
  successes: number;
  failures: number;
  successRate: number; // percentage
  failureRate: number;
  avgEnergy?: number;
  avgMood?: number;
  avgDifficulty?: number;
  successEnergy?: number;
  failureEnergy?: number;
}

export interface TimeBlockAnalysis {
  label: string;
  totalAttempts: number;
  successes: number;
  failures: number;
  successRate: number;
  avgEnergy?: number;
  avgMood?: number;
  consistency: number; // 0-100, measures variability
}

export interface BehavioralAnalysis {
  totalEvents: number;
  overallSuccessRate: number;
  overallFailureRate: number;
  taskTypeStats: TaskTypeStats[];
  timeBlockAnalysis: TimeBlockAnalysis[];
  bestPerformingTimeBlock?: TimeBlockAnalysis;
  worstPerformingTimeBlock?: TimeBlockAnalysis;
  energyOutcomeCorrelation?: number;
  moodOutcomeCorrelation?: number;
  consistencyScore: number; // 0-100
  planningAccuracy?: number; // % of events with executedTime matching plannedTime
}

export interface BehavioralInsight {
  type: 'strength' | 'weakness' | 'pattern' | 'opportunity';
  title: string;
  description: string;
  metric: number;
  priority: 'high' | 'medium' | 'low';
  actionable: string;
}

/**
 * Normalize behavioral events from database
 * @param events Raw event records
 * @returns Normalized events
 */
export function normalizeTasks(events: any[]): TaskEvent[] {
  return events.map((e) => ({
    id: e.id || '',
    userId: e.userId || '',
    type: typeof e.type === 'string' ? e.type.trim().toLowerCase() : 'unknown',
    difficulty: e.difficulty,
    plannedStart: new Date(e.plannedStart).toISOString(),
    timezone: e.timezone,
    localHour: e.localHour,
    localWeekday: e.localWeekday,
    cognitiveLoad: e.cognitiveLoad ?? undefined,
    plannedMinutes: e.plannedMinutes ?? undefined,
    actualStart: e.actualStart ? new Date(e.actualStart).toISOString() : undefined,
    actualMinutes: e.actualMinutes ?? undefined,
    energyAtStart: e.energyAtStart ?? undefined,
    moodAtStart: e.moodAtStart ?? undefined,
    outcome: e.outcome ?? null,
    createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
  }));
}

/**
 * Analyze task type performance
 * @param events Behavioral events
 * @returns Task type statistics
 */
export function analyzeTaskTypes(events: TaskEvent[]): TaskTypeStats[] {
  const finished = events.filter((event) => event.outcome !== null && event.outcome !== undefined);
  const grouped = groupBy(finished, (e) => e.type || 'unknown');
  const stats: TaskTypeStats[] = [];

  for (const [taskType, typeEvents] of grouped) {
    const successes = typeEvents.filter((e) => e.outcome === 'SUCCESS').length;
    const failures = typeEvents.filter((e) => e.outcome === 'FAIL').length;
    const total = typeEvents.length;

    const successEnergy = typeEvents
      .filter((e) => e.outcome === 'SUCCESS' && e.energyAtStart !== undefined)
      .map((e) => e.energyAtStart!);
    const failureEnergy = typeEvents
      .filter((e) => e.outcome === 'FAIL' && e.energyAtStart !== undefined)
      .map((e) => e.energyAtStart!);

    const allEnergy = typeEvents.filter((e) => e.energyAtStart !== undefined).map((e) => e.energyAtStart!);
    const allMood = typeEvents.filter((e) => e.moodAtStart !== undefined).map((e) => e.moodAtStart!);
    const allDifficulty = typeEvents.filter((e) => e.difficulty !== undefined).map((e) => e.difficulty!);

    const avgEnergy = allEnergy.length > 0 ? Number((allEnergy.reduce((a, b) => a + b, 0) / allEnergy.length).toFixed(2)) : undefined;
    const avgMood = allMood.length > 0 ? Number((allMood.reduce((a, b) => a + b, 0) / allMood.length).toFixed(2)) : undefined;
    const avgDifficulty = allDifficulty.length > 0 ? Number((allDifficulty.reduce((a, b) => a + b, 0) / allDifficulty.length).toFixed(2)) : undefined;

    const successEnergyAvg = successEnergy.length > 0 ? Number((successEnergy.reduce((a, b) => a + b, 0) / successEnergy.length).toFixed(2)) : undefined;
    const failureEnergyAvg = failureEnergy.length > 0 ? Number((failureEnergy.reduce((a, b) => a + b, 0) / failureEnergy.length).toFixed(2)) : undefined;

    stats.push({
      taskType,
      totalAttempts: total,
      successes,
      failures,
      successRate: total > 0 ? Number(((successes / total) * 100).toFixed(1)) : 0,
      failureRate: total > 0 ? Number(((failures / total) * 100).toFixed(1)) : 0,
      avgEnergy,
      avgMood,
      avgDifficulty,
      successEnergy: successEnergyAvg,
      failureEnergy: failureEnergyAvg,
    });
  }

  // Sort by frequency
  stats.sort((a, b) => b.totalAttempts - a.totalAttempts);
  return stats;
}

/**
 * Analyze performance by time of day
 * @param events Behavioral events
 * @returns Time block analysis
 */
export function analyzeByTimeOfDay(events: TaskEvent[]): TimeBlockAnalysis[] {
  const blocks = [
    { label: 'Night', start: 0, end: 6 },
    { label: 'Morning', start: 6, end: 12 },
    { label: 'Afternoon', start: 12, end: 17 },
    { label: 'Evening', start: 17, end: 21 },
    { label: 'Late', start: 21, end: 24 },
  ];

  const analysis: TimeBlockAnalysis[] = [];

  for (const block of blocks) {
    const blockEvents = events.filter((event) =>
      event.outcome !== null && event.outcome !== undefined &&
      event.localHour >= block.start && event.localHour < block.end);

    if (blockEvents.length === 0) continue;

    const successes = blockEvents.filter((e) => e.outcome === 'SUCCESS').length;
    const failures = blockEvents.filter((e) => e.outcome === 'FAIL').length;

    const energyValues = blockEvents
      .filter((e) => e.energyAtStart !== undefined)
      .map((e) => e.energyAtStart!);
    const moodValues = blockEvents
      .filter((e) => e.moodAtStart !== undefined)
      .map((e) => e.moodAtStart!);

    const avgEnergy = energyValues.length > 0 ? Number((energyValues.reduce((a, b) => a + b, 0) / energyValues.length).toFixed(2)) : undefined;
    const avgMood = moodValues.length > 0 ? Number((moodValues.reduce((a, b) => a + b, 0) / moodValues.length).toFixed(2)) : undefined;

    // Consistency: measure how varied success rates are across this block
    // Lower variance = higher consistency
    const energyMetrics = computeMetrics(energyValues);
    const consistency = energyMetrics ? Math.max(0, 100 - energyMetrics.stdDev * 10) : 50;

    analysis.push({
      label: block.label,
      totalAttempts: blockEvents.length,
      successes,
      failures,
      successRate: Number(((successes / blockEvents.length) * 100).toFixed(1)),
      avgEnergy,
      avgMood,
      consistency: Number(consistency.toFixed(1)),
    });
  }

  return analysis;
}

/**
 * Compute comprehensive behavioral analysis
 * @param events Behavioral events
 * @param energyData Optional array of energy values for correlation
 * @returns Behavioral analysis results
 */
export function analyzeBehavior(events: TaskEvent[], energyData?: number[]): BehavioralAnalysis {
  if (events.length === 0) {
    return {
      totalEvents: 0,
      overallSuccessRate: 0,
      overallFailureRate: 0,
      taskTypeStats: [],
      timeBlockAnalysis: [],
      consistencyScore: 0,
    };
  }

  // Overall success/failure rates
  const finished = events.filter((event) => event.outcome !== null && event.outcome !== undefined);
  if (finished.length === 0) {
    return {
      totalEvents: 0,
      overallSuccessRate: 0,
      overallFailureRate: 0,
      taskTypeStats: [],
      timeBlockAnalysis: [],
      consistencyScore: 0,
    };
  }
  const successCount = finished.filter((e) => e.outcome === 'SUCCESS').length;
  const failureCount = finished.filter((e) => e.outcome === 'FAIL').length;
  const overallSuccessRate = Number(((successCount / finished.length) * 100).toFixed(1));
  const overallFailureRate = Number(((failureCount / finished.length) * 100).toFixed(1));

  // Task type analysis
  const taskTypeStats = analyzeTaskTypes(events);

  // Time block analysis
  const timeBlockAnalysis = analyzeByTimeOfDay(events);

  // Best and worst time blocks
  const sortedBlocks = [...timeBlockAnalysis].sort((a, b) => b.successRate - a.successRate);
  const bestPerformingTimeBlock = sortedBlocks[0];
  const worstPerformingTimeBlock = sortedBlocks[sortedBlocks.length - 1];

  // Correlations
  const withEnergy = finished.filter((event) => event.energyAtStart !== undefined);
  const withMood = finished.filter((event) => event.moodAtStart !== undefined);
  const energyOutcomes = withEnergy.map((event) => event.outcome === 'SUCCESS' ? 1 : 0);
  const moodOutcomes = withMood.map((event) => event.outcome === 'SUCCESS' ? 1 : 0);
  const energyValues = withEnergy.map((event) => event.energyAtStart!);
  const moodValues = withMood.map((event) => event.moodAtStart!);

  const maybeEnergyCorr = energyOutcomes.length > 1
    ? computePearsonCorrelation(energyValues, energyOutcomes)
    : null;
  const maybeMoodCorr = moodOutcomes.length > 1
    ? computePearsonCorrelation(moodValues, moodOutcomes)
    : null;

  let energyOutcomeCorrelation: number | undefined = maybeEnergyCorr !== null ? maybeEnergyCorr : undefined;
  let moodOutcomeCorrelation: number | undefined = maybeMoodCorr !== null ? maybeMoodCorr : undefined;

  // Consistency score: average success rate variance across task types
  const successRates = taskTypeStats.map((t) => t.successRate);
  const avgSuccessRate = successRates.reduce((a, b) => a + b, 0) / successRates.length || 0;
  const variance = successRates.reduce((a, b) => a + Math.pow(b - avgSuccessRate, 2), 0) / successRates.length;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(0, 100 - stdDev * 5);

  // Planning accuracy: % of events where planned and executed times are within reasonable window (24 hours)
  let planningAccuracy = 0;
  const withPlannedAndExecuted = finished.filter((e) => e.actualStart);
  if (withPlannedAndExecuted.length > 0) {
    const matching = withPlannedAndExecuted.filter((e) => {
      const planned = new Date(e.plannedStart).getTime();
      const executed = new Date(e.actualStart!).getTime();
      const diff = Math.abs(executed - planned);
      return diff < 24 * 60 * 60 * 1000; // 24 hours
    }).length;
    planningAccuracy = Number(((matching / withPlannedAndExecuted.length) * 100).toFixed(1));
  }

  return {
    totalEvents: finished.length,
    overallSuccessRate,
    overallFailureRate,
    taskTypeStats,
    timeBlockAnalysis,
    bestPerformingTimeBlock,
    worstPerformingTimeBlock,
    energyOutcomeCorrelation,
    moodOutcomeCorrelation,
    consistencyScore: Number(consistencyScore.toFixed(1)),
    planningAccuracy: withPlannedAndExecuted.length > 0 ? planningAccuracy : undefined,
  };
}

/**
 * Compute Pearson correlation between two numeric arrays
 * @param x First array
 * @param y Second array
 * @returns Correlation coefficient or null
 */
function computePearsonCorrelation(x: number[], y: number[]): number | null {
  if (x.length !== y.length || x.length < 2) return null;

  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let sumXY = 0,
    sumX2 = 0,
    sumY2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    sumXY += dx * dy;
    sumX2 += dx * dx;
    sumY2 += dy * dy;
  }

  const denom = Math.sqrt(sumX2 * sumY2);
  return denom === 0 ? null : Number((sumXY / denom).toFixed(3));
}

/**
 * Generate actionable behavioral insights
 * @param analysis Behavioral analysis
 * @returns Array of behavioral insights
 */
export function generateBehavioralInsights(analysis: BehavioralAnalysis): BehavioralInsight[] {
  const insights: BehavioralInsight[] = [];

  // High success rate strength
  if (analysis.overallSuccessRate > 75) {
    insights.push({
      type: 'strength',
      title: 'Exceptional Success Rate',
      description: `You're succeeding ${analysis.overallSuccessRate}% of the time. This is excellent!`,
      metric: analysis.overallSuccessRate,
      priority: 'medium',
      actionable: "Maintain current strategies and document what's working for consistent replication.",
    });
  }

  // Best time block opportunity
  if (analysis.bestPerformingTimeBlock && analysis.bestPerformingTimeBlock.successRate > 70) {
    insights.push({
      type: 'opportunity',
      title: `Peak Performance: ${analysis.bestPerformingTimeBlock.label}`,
      description: `Your success rate during ${analysis.bestPerformingTimeBlock.label.toLowerCase()} is ${analysis.bestPerformingTimeBlock.successRate}%.`,
      metric: analysis.bestPerformingTimeBlock.successRate,
      priority: 'high',
      actionable: `Schedule your most important and difficult tasks during ${analysis.bestPerformingTimeBlock.label.toLowerCase()}.`,
    });
  }

  // Worst time block weakness
  if (analysis.worstPerformingTimeBlock && analysis.worstPerformingTimeBlock.successRate < 50) {
    insights.push({
      type: 'weakness',
      title: `Challenging Period: ${analysis.worstPerformingTimeBlock.label}`,
      description: `Your success rate during ${analysis.worstPerformingTimeBlock.label.toLowerCase()} is only ${analysis.worstPerformingTimeBlock.successRate}%.`,
      metric: analysis.worstPerformingTimeBlock.successRate,
      priority: 'high',
      actionable: `Avoid scheduling critical tasks during ${analysis.worstPerformingTimeBlock.label.toLowerCase()}. If unavoidable, allocate extra time and resources.`,
    });
  }

  // Energy correlation
  if (analysis.energyOutcomeCorrelation && analysis.energyOutcomeCorrelation > 0.6) {
    insights.push({
      type: 'pattern',
      title: 'Strong Energy-Success Link',
      description: 'Your energy level has a strong positive correlation with success.',
      metric: analysis.energyOutcomeCorrelation * 100,
      priority: 'high',
      actionable: 'Prioritize maintaining high energy through rest, nutrition, and exercise. Energy management is key to your success.',
    });
  }

  // Low consistency warning
  if (analysis.consistencyScore < 40) {
    insights.push({
      type: 'weakness',
      title: 'Inconsistent Performance Across Tasks',
      description: `Your success rate varies significantly across different task types (consistency: ${analysis.consistencyScore}%).`,
      metric: analysis.consistencyScore,
      priority: 'medium',
      actionable: 'Identify what makes certain tasks more successful than others. Look for common factors in your most successful tasks.',
    });
  }

  // Task type opportunity
  const bestTaskType = analysis.taskTypeStats[0];
  if (bestTaskType && bestTaskType.successRate > 80) {
    insights.push({
      type: 'strength',
      title: `Master of ${bestTaskType.taskType} Tasks`,
      description: `You excel at ${bestTaskType.taskType} tasks with ${bestTaskType.successRate}% success rate.`,
      metric: bestTaskType.successRate,
      priority: 'low',
      actionable: 'Your expertise in this area is a strength. Consider leveraging it in other work areas or mentoring others.',
    });
  }

  // Sort by priority
  const priorityRank = { high: 3, medium: 2, low: 1 } as Record<string, number>;
  insights.sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]);

  return insights.slice(0, 5);
}
