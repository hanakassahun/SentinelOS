import { createHash } from 'node:crypto';
import prisma from './prismaClient';
import { correlateTimeBlocks } from '../intelligence/correlator';
import type { PerformanceInsight } from '../intelligence/correlator';
import type { TaskEvent } from '../intelligence/types';

async function loadTimeBlockPerformance(userId: string): Promise<PerformanceInsight[]> {
  const rows = await prisma.behavioralEvent.findMany({
    where: { userId },
    select: {
      plannedTime: true,
      executedTime: true,
      outcome: true,
    },
  });

  const events: TaskEvent[] = rows.map((row) => ({
    plannedTime: row.plannedTime?.toISOString() ?? null,
    executedTime: row.executedTime?.toISOString() ?? null,
    outcome: row.outcome,
  }));

  return correlateTimeBlocks(events);
}

export function getTimeBlockPerformance(userId: string): Promise<PerformanceInsight[]> {
  return loadTimeBlockPerformance(userId);
}

function insightId(userId: string, hourBlock: number): string {
  const key = JSON.stringify(['TIME_OF_DAY', userId, hourBlock]);
  return `time-block-${createHash('sha256').update(key).digest('hex')}`;
}

export async function refreshInsights(userId: string): Promise<PerformanceInsight[]> {
  const blocks = await loadTimeBlockPerformance(userId);
  const highRiskBlocks = blocks.filter((block) => block.riskFlag && block.successRate !== null);

  await Promise.all(highRiskBlocks.map((block) => {
    const id = insightId(userId, block.hourBlock);
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
  }));

  return blocks;
}