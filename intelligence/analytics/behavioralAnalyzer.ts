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

import { BehavioralEvent } from '../types';
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
export function normalizeBehavioralEvents(events: any[]): BehavioralEvent[] {
  return events.map((e) => ({
    id: e.id || '',
    userId: e.userId || '',
    taskType: e.taskType || 'unknown',
    plannedTime: e.plannedTime ? new Date(e.plannedTime).toISOString() : undefined,
    executedTime: e.executedTime ? new Date(e.executedTime).toISOString() : undefined,
    energyLevel: e.energyLevel as any,
    moodLevel: e.moodLevel as any,
    difficulty: e.difficulty,
    outcome: e.outcome as any,
    createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
  }));
}

/**
 * Analyze task type performance
 * @param events Behavioral events
 * @returns Task type statistics
 */
export function analyzeTaskTypes(events: BehavioralEvent[]): TaskTypeStats[] {
  const grouped = groupBy(events, (e) => e.taskType || 'unknown');
  const stats: TaskTypeStats[] = [];

  for (const [taskType, typeEvents] of grouped) {
    const successes = typeEvents.filter((e) => e.outcome === 'success').length;
    const failures = typeEvents.filter((e) => e.outcome === 'fail').length;
    const total = typeEvents.length;

    const successEnergy = typeEvents
      .filter((e) => e.outcome === 'success' && e.energyLevel !== undefined)
      .map((e) => e.energyLevel!);
    const failureEnergy = typeEvents
      .filter((e) => e.outcome === 'fail' && e.energyLevel !== undefined)
      .map((e) => e.energyLevel!);

    const allEnergy = typeEvents.filter((e) => e.energyLevel !== undefined).map((e) => e.energyLevel!);
    const allMood = typeEvents.filter((e) => e.moodLevel !== undefined).map((e) => e.moodLevel!);
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
export function analyzeByTimeOfDay(events: BehavioralEvent[]): TimeBlockAnalysis[] {
  const blocks = [
    { label: 'Night', start: 0, end: 6 },
    { label: 'Morning', start: 6, end: 12 },
    { label: 'Afternoon', start: 12, end: 17 },
    { label: 'Evening', start: 17, end: 21 },
    { label: 'Late', start: 21, end: 24 },
  ];

  const analysis: TimeBlockAnalysis[] = [];

  for (const block of blocks) {
    const blockEvents = events.filter((e) => {
      const time = e.executedTime || e.plannedTime || e.createdAt;
      const hour = new Date(time).getHours();
      return hour >= block.start && hour < block.end;
    });

    if (blockEvents.length === 0) continue;

    const successes = blockEvents.filter((e) => e.outcome === 'success').length;
    const failures = blockEvents.filter((e) => e.outcome === 'fail').length;

    const energyValues = blockEvents
      .filter((e) => e.energyLevel !== undefined)
      .map((e) => e.energyLevel!);
    const moodValues = blockEvents
      .filter((e) => e.moodLevel !== undefined)
      .map((e) => e.moodLevel!);

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
export function analyzeBehavior(events: BehavioralEvent[], energyData?: number[]): BehavioralAnalysis {
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
  const successCount = events.filter((e) => e.outcome === 'success').length;
  const failureCount = events.filter((e) => e.outcome === 'fail').length;
  const overallSuccessRate = Number(((successCount / events.length) * 100).toFixed(1));
  const overallFailureRate = Number(((failureCount / events.length) * 100).toFixed(1));

  // Task type analysis
  const taskTypeStats = analyzeTaskTypes(events);

  // Time block analysis
  const timeBlockAnalysis = analyzeByTimeOfDay(events);

  // Best and worst time blocks
  const sortedBlocks = [...timeBlockAnalysis].sort((a, b) => b.successRate - a.successRate);
  const bestPerformingTimeBlock = sortedBlocks[0];
  const worstPerformingTimeBlock = sortedBlocks[sortedBlocks.length - 1];

  // Correlations
  const outcomeNumeric = events
    .filter((e) => e.outcome !== undefined)
    .map((e) => (e.outcome === 'success' ? 1 : 0));
  const energyValues = events
    .filter((e) => e.energyLevel !== undefined)
    .map((e) => e.energyLevel!);
  const moodValues = events
    .filter((e) => e.moodLevel !== undefined)
    .map((e) => e.moodLevel!);

  const maybeEnergyCorr = outcomeNumeric.length === energyValues.length && energyValues.length > 1
    ? computePearsonCorrelation(energyValues, outcomeNumeric)
    : null;
  const maybeMoodCorr = outcomeNumeric.length === moodValues.length && moodValues.length > 1
    ? computePearsonCorrelation(moodValues, outcomeNumeric)
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
  const withPlannedAndExecuted = events.filter((e) => e.plannedTime && e.executedTime);
  if (withPlannedAndExecuted.length > 0) {
    const matching = withPlannedAndExecuted.filter((e) => {
      const planned = new Date(e.plannedTime!).getTime();
      const executed = new Date(e.executedTime!).getTime();
      const diff = Math.abs(executed - planned);
      return diff < 24 * 60 * 60 * 1000; // 24 hours
    }).length;
    planningAccuracy = Number(((matching / withPlannedAndExecuted.length) * 100).toFixed(1));
  }

  return {
    totalEvents: events.length,
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
