import prisma from '../server/services/prismaClient';

export interface PerformanceInsight {
  hourBlock: number;
  successRate: number;
  totalTasks: number;
  riskFlag: boolean;
}

function normalizeOutcome(outcome?: string | null): boolean {
  const normalized = (outcome ?? '').toLowerCase();
  return ['completed', 'complete', 'success', 'succeeded', 'done'].includes(normalized);
}

export async function calculateTimeBlockSuccess(userId: string): Promise<PerformanceInsight[]> {
  const tasks = await prisma.behavioralEvent.findMany({
    where: { userId },
    select: {
      plannedTime: true,
      executedTime: true,
      outcome: true,
    },
  });

  const blocks: Record<number, { completed: number; total: number }> = {};

  for (let i = 0; i < 24; i += 1) {
    blocks[i] = { completed: 0, total: 0 };
  }

  tasks.forEach((task) => {
    const referenceTime = task.executedTime ?? task.plannedTime;
    if (!referenceTime) {
      return;
    }

    const hour = new Date(referenceTime).getHours();
    blocks[hour].total += 1;

    if (normalizeOutcome(task.outcome)) {
      blocks[hour].completed += 1;
    }
  });

  return Object.keys(blocks).map((key) => {
    const hourBlock = parseInt(key, 10);
    const { completed, total } = blocks[hourBlock];
    const successRate = total > 0 ? (completed / total) * 100 : 100;

    return {
      hourBlock,
      successRate: Math.round(successRate),
      totalTasks: total,
      riskFlag: total >= 3 && successRate < 60,
    };
  });
}
