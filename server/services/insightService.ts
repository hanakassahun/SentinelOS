import prisma from './prismaClient';
import { correlateTimeBlocks } from '../../intelligence/correlator';
import type { PerformanceInsight } from '../../intelligence/correlator';
import { analyzeBehavior, generateBehavioralInsights } from '../../intelligence/analytics/behavioralAnalyzer';
import type { BehavioralAnalysis, BehavioralInsight } from '../../intelligence/analytics/behavioralAnalyzer';
import type { CheckInEvent, TaskEvent } from '../../intelligence/types';

export interface BehavioralInsightReport {
  userId: string;
  analysis: BehavioralAnalysis;
  insights: BehavioralInsight[];
  timeBlocks: PerformanceInsight[];
  tasks: TaskEvent[];
  checkIns: CheckInEvent[];
}

async function loadTasks(userId: string): Promise<TaskEvent[]> {
  const rows = await prisma.task.findMany({
    where: { userId },
    orderBy: { plannedStart: 'desc' },
    take: 1000,
    select: {
      id: true,
      userId: true,
      type: true,
      difficulty: true,
      plannedStart: true,
      timezone: true,
      localHour: true,
      localWeekday: true,
      cognitiveLoad: true,
      plannedMinutes: true,
      actualStart: true,
      actualMinutes: true,
      energyAtStart: true,
      moodAtStart: true,
      outcome: true,
      createdAt: true,
    },
  });

  return rows.map((row) => ({
    ...row,
    plannedStart: row.plannedStart.toISOString(),
    actualStart: row.actualStart?.toISOString() ?? undefined,
    cognitiveLoad: row.cognitiveLoad ?? undefined,
    plannedMinutes: row.plannedMinutes ?? undefined,
    actualMinutes: row.actualMinutes ?? undefined,
    energyAtStart: row.energyAtStart ?? undefined,
    moodAtStart: row.moodAtStart ?? undefined,
    outcome: row.outcome ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

async function loadCheckIns(userId: string): Promise<CheckInEvent[]> {
  const rows = await prisma.checkIn.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: 1000,
    select: {
      id: true,
      userId: true,
      kind: true,
      value: true,
      predictedValue: true,
      timestamp: true,
      timezone: true,
      note: true,
      createdAt: true,
    },
  });

  return rows.map((row) => ({
    ...row,
    value: row.value as CheckInEvent['value'],
    predictedValue: row.predictedValue as CheckInEvent['predictedValue'],
    timezone: row.timezone ?? undefined,
    note: row.note ?? undefined,
    timestamp: row.timestamp.toISOString(),
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getBehavioralInsightReport(userId: string): Promise<BehavioralInsightReport> {
  const [tasks, checkIns] = await Promise.all([loadTasks(userId), loadCheckIns(userId)]);
  const finishedTasks = tasks.filter((task) => task.outcome !== null);
  const analysis = analyzeBehavior(finishedTasks);

  return {
    userId,
    analysis,
    insights: generateBehavioralInsights(analysis),
    timeBlocks: correlateTimeBlocks(tasks),
    tasks,
    checkIns,
  };
}

export function getTimeBlockPerformance(userId: string): Promise<PerformanceInsight[]> {
  return loadTasks(userId).then((tasks) => correlateTimeBlocks(tasks));
}

function buildTimeBlockFindings(tasks: TaskEvent[]) {
  const groups = new Map<string, TaskEvent[]>();
  for (const task of tasks) {
    if (!task.outcome) continue;
    const groupKey = `${task.type}:${task.localHour}`;
    const group = groups.get(groupKey) ?? [];
    group.push(task);
    groups.set(groupKey, group);
  }

  return Array.from(groups.entries()).flatMap(([groupKey, events]) => {
    if (events.length < 8) return [];
    const successes = events.filter((event) => event.outcome === 'SUCCESS').length;
    const failures = events.length - successes;
    const successRate = successes / events.length * 100;
    if (successRate >= 60) return [];

    const [scope, hour] = groupKey.split(':');
    const orderedTimes = events.map((event) => new Date(event.plannedStart).getTime()).sort((a, b) => a - b);
    const localHour = Number(hour);

    return [{
      type: 'TIME_OF_DAY' as const,
      dedupeKey: `TIME_OF_DAY:${scope}:${localHour}`,
      message: `${events.length} ${scope} tasks planned around ${String(localHour).padStart(2, '0')}:00 had a ${successRate.toFixed(0)}% success rate.`,
      recommendation: `Consider moving ${scope} tasks away from ${String(localHour).padStart(2, '0')}:00.`,
      priority: 'HIGH' as const,
      confidence: 1 - successRate / 100,
      sampleSize: events.length,
      windowStart: new Date(orderedTimes[0]),
      windowEnd: new Date(orderedTimes[orderedTimes.length - 1]),
      evidence: {
        taskType: scope,
        localHour,
        successes,
        failures,
        successRate: Number(successRate.toFixed(1)),
        outcomeCount: events.length,
      },
    }];
  });
}

function buildCheckInFindings(checkIns: CheckInEvent[]) {
  const mondayEnergy = checkIns.filter((checkIn) => {
    if (checkIn.kind !== 'ENERGY' || checkIn.predictedValue === undefined) return false;
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: checkIn.timezone || 'UTC',
        weekday: 'short',
      }).format(new Date(checkIn.timestamp)) === 'Mon';
    } catch {
      return false;
    }
  });
  if (mondayEnergy.length < 8) return [];

  const averageOverestimate = mondayEnergy.reduce((sum, checkIn) => sum + checkIn.predictedValue! - checkIn.value, 0) / mondayEnergy.length;
  if (averageOverestimate < 2) return [];
  const orderedTimes = mondayEnergy.map((checkIn) => new Date(checkIn.timestamp).getTime()).sort((a, b) => a - b);

  return [{
    type: 'TREND' as const,
    dedupeKey: 'TREND:ENERGY:MONDAY',
    message: `Monday energy is overestimated by an average of ${averageOverestimate.toFixed(1)} points.`,
    recommendation: 'Compare planned energy with actual check-ins before scheduling demanding Monday work.',
    priority: 'MEDIUM' as const,
    confidence: Math.min(1, mondayEnergy.length / 16),
    sampleSize: mondayEnergy.length,
    windowStart: new Date(orderedTimes[0]),
    windowEnd: new Date(orderedTimes[orderedTimes.length - 1]),
    evidence: {
      kind: 'ENERGY',
      localWeekday: 'MONDAY',
      averageOverestimate: Number(averageOverestimate.toFixed(1)),
      sampleSize: mondayEnergy.length,
    },
  }];
}

export async function refreshInsights(userId: string): Promise<BehavioralInsightReport> {
  const report = await getBehavioralInsightReport(userId);
  const findings = [
    ...buildTimeBlockFindings(report.tasks),
    ...buildCheckInFindings(report.checkIns),
  ];

  await Promise.all(findings.map((finding) => prisma.insight.upsert({
    where: { userId_dedupeKey: { userId, dedupeKey: finding.dedupeKey } },
    update: {
      message: finding.message,
      recommendation: finding.recommendation,
      priority: finding.priority,
      confidence: finding.confidence,
      sampleSize: finding.sampleSize,
      windowStart: finding.windowStart,
      windowEnd: finding.windowEnd,
      evidence: finding.evidence,
    },
    create: {
      userId,
      ...finding,
      status: 'NEW',
    },
  })));

  return report;
}
