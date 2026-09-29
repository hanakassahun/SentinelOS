import type { TaskEvent } from './types';

export interface PerformanceInsight {
  hourBlock: number;
  successRate: number | null;
  totalTasks: number;
  riskFlag: boolean;
}

export interface AggregatedTaskHistory {
  hourBlock: number;
  averageEnergy: number | null;
  successRate: number;
}

export interface HighFrictionZone {
  hourBlock: number;
  successRate: number;
  rollingAverage: number;
  standardDeviation: number;
  deviationFromBaseline: number;
  reason: string;
}

export interface InsightTemplatePayload extends HighFrictionZone {
  averageEnergy: number | null;
}

export class InsightTemplateEngine {
  private readonly templates: Record<string, (payload: InsightTemplatePayload) => string> = {
    morning: ({ hourBlock, successRate, rollingAverage }) =>
      `You finish work ${Math.round((successRate / Math.max(rollingAverage, 1)) * 100)}% more often during your morning blocks. Consider moving this task out of your ${this.formatHour(hourBlock)} high-friction window.`,
    afternoon: ({ hourBlock, successRate, rollingAverage }) =>
      `Your afternoon rhythm is showing friction. You are finishing tasks at ${successRate}% success versus a ${Math.round(rollingAverage)}% rolling baseline, so move demanding work away from ${this.formatHour(hourBlock)}.`,
    evening: ({ hourBlock, successRate, rollingAverage }) =>
      `Your evening plan is underperforming. You are succeeding at ${successRate}% versus ${Math.round(rollingAverage)}% historically, so consider rescheduling this task away from ${this.formatHour(hourBlock)}.`,
    night: ({ hourBlock, successRate, rollingAverage }) =>
      `You finish work ${Math.round((successRate / Math.max(rollingAverage, 1)) * 100)}% more often during your morning blocks. Consider moving this task out of your ${this.formatHour(hourBlock)} high-friction window.`,
  };

  public render(payload: InsightTemplatePayload): string {
    const period = this.getTimePeriod(payload.hourBlock);
    return this.templates[period](payload);
  }

  private getTimePeriod(hourBlock: number): keyof InsightTemplateEngine['templates'] {
    if (hourBlock >= 5 && hourBlock < 12) return 'morning';
    if (hourBlock >= 12 && hourBlock < 18) return 'afternoon';
    if (hourBlock >= 18 && hourBlock < 23) return 'evening';
    return 'night';
  }

  private formatHour(hourBlock: number): string {
    const suffix = hourBlock >= 12 ? 'PM' : 'AM';
    const normalized = hourBlock % 12 === 0 ? 12 : hourBlock % 12;
    return `${normalized} ${suffix}`;
  }
}

function normalizeOutcome(outcome?: string | null): boolean {
  const normalized = (outcome ?? '').toLowerCase();
  return ['completed', 'complete', 'success', 'succeeded', 'done'].includes(normalized);
}

export function analyzeDeviations(history: AggregatedTaskHistory[]): HighFrictionZone[] {
  if (history.length === 0) {
    return [];
  }

  const successRates = history.map((entry) => entry.successRate);
  const baselineMean = successRates.reduce((sum, value) => sum + value, 0) / successRates.length;
  const variance = successRates.reduce((sum, value) => sum + (value - baselineMean) ** 2, 0) / successRates.length;
  const standardDeviation = Math.sqrt(variance);

  return history
    .map((entry, index) => {
      const previousEntries = history.slice(Math.max(0, index - 3), index + 1);
      const rollingAverage = previousEntries.reduce((sum, item) => sum + item.successRate, 0) / previousEntries.length;
      const deviationFromBaseline = entry.successRate - baselineMean;
      const isSignificantDrop = entry.successRate < baselineMean - Math.max(10, standardDeviation * 0.75);

      if (!isSignificantDrop) {
        return null;
      }

      return {
        hourBlock: entry.hourBlock,
        successRate: entry.successRate,
        rollingAverage,
        standardDeviation,
        deviationFromBaseline,
        reason: `Success rate fell ${Math.abs(deviationFromBaseline).toFixed(1)} points below the user's baseline.`,
      };
    })
    .filter((item): item is HighFrictionZone => item !== null)
    .sort((a, b) => a.hourBlock - b.hourBlock);
}

export function correlateTimeBlocks(events: readonly TaskEvent[]): PerformanceInsight[] {
  const blocks: Record<number, { completed: number; total: number }> = {};

  for (let i = 0; i < 24; i += 1) {
    blocks[i] = { completed: 0, total: 0 };
  }

  events.forEach((task) => {
    const referenceTime = task.executedTime ?? task.plannedTime;
    if (!referenceTime) {
      return;
    }

    const hour = new Date(referenceTime).getHours();
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      return;
    }

    blocks[hour].total += 1;

    if (normalizeOutcome(task.outcome)) {
      blocks[hour].completed += 1;
    }
  });

  return Object.keys(blocks).map((key) => {
    const hourBlock = parseInt(key, 10);
    const { completed, total } = blocks[hourBlock];
    const successRate = total > 0 ? (completed / total) * 100 : null;

    return {
      hourBlock,
      successRate: successRate === null ? null : Math.round(successRate),
      totalTasks: total,
      riskFlag: total >= 3 && successRate !== null && successRate < 60,
    };
  });
}
