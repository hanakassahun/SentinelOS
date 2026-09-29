import { createHash } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import prisma from './prismaClient';
import { correlateTimeBlocks } from '../../intelligence/correlator';
import type { PerformanceInsight } from '../../intelligence/correlator';
import { analyzeBehavior, generateBehavioralInsights, normalizeBehavioralEvents } from '../../intelligence/analytics/behavioralAnalyzer';
import type { BehavioralAnalysis, BehavioralInsight } from '../../intelligence/analytics/behavioralAnalyzer';
import type { BehavioralEvent, TaskEvent } from '../../intelligence/types';

export interface BehavioralInsightReport {
  userId: string;
  analysis: BehavioralAnalysis;
  insights: BehavioralInsight[];
  timeBlocks: PerformanceInsight[];
  events: BehavioralEvent[];
}

async function loadBehavioralEvents(userId: string): Promise<BehavioralEvent[]> {
  const rows = await prisma.behavioralEvent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: {
      id: true,
      userId: true,
      taskType: true,
      plannedTime: true,
      executedTime: true,
      energyLevel: true,
      moodLevel: true,
      difficulty: true,
      outcome: true,
      createdAt: true,
    },
  });

  return normalizeBehavioralEvents(rows);
}

export async function getBehavioralInsightReport(userId: string): Promise<BehavioralInsightReport> {
  const events = await loadBehavioralEvents(userId);
  const taskEvents: TaskEvent[] = events.map((event) => ({
    plannedTime: event.plannedTime,
    executedTime: event.executedTime,
    outcome: event.outcome,
  }));
  const analysis = analyzeBehavior(events);

  return {
    userId,
    analysis,
    insights: generateBehavioralInsights(analysis),
    timeBlocks: correlateTimeBlocks(taskEvents),
    events,
  };
}

function insightId(kind: string, userId: string, hourBlock?: number): string {
  const key = JSON.stringify([kind, userId, hourBlock ?? null]);
  return `${kind.toLowerCase()}-${createHash('sha256').update(key).digest('hex')}`;
}

export function getTimeBlockPerformance(userId: string): Promise<PerformanceInsight[]> {
  return loadBehavioralEvents(userId).then((events) => correlateTimeBlocks(events));
}

export async function refreshInsights(userId: string): Promise<BehavioralInsightReport> {
  const report = await getBehavioralInsightReport(userId);
  if (report.events.length === 0) {
    return report;
  }

  const upserts = report.timeBlocks
    .filter((block) => block.riskFlag && block.successRate !== null)
    .map((block) => {
      const id = insightId('TIME_OF_DAY', userId, block.hourBlock);
      const message = `You underperformed on tasks after ${block.hourBlock}:00. Consider rescheduling.`;
      const data = {
        type: 'TIME_OF_DAY' as const,
        message,
        recommendation: 'Reschedule demanding work to a higher-performing time block.',
        priority: 'medium',
        confidence: block.successRate! / 100,
        insights: {
          hourBlock: block.hourBlock,
          successRate: block.successRate,
          totalTasks: block.totalTasks,
        },
        analysis: {
          source: 'rule-based-correlator',
          riskFlag: true,
        },
      };

      return prisma.insight.upsert({
        where: { id },
        update: data,
        create: { id, userId, ...data },
      });
    });

  const summaryId = insightId('BEHAVIORAL', userId);
  const summaryData = {
    type: 'TREND' as const,
    message: 'Behavioral insight analysis',
    recommendation: null,
    priority: 'low',
    confidence: null,
    insights: JSON.parse(JSON.stringify(report.insights)) as Prisma.InputJsonValue,
    analysis: JSON.parse(JSON.stringify(report.analysis)) as Prisma.InputJsonValue,
  };

  upserts.push(prisma.insight.upsert({
    where: { id: summaryId },
    update: summaryData,
    create: { id: summaryId, userId, ...summaryData },
  }));

  await Promise.all(upserts);
  return report;
}