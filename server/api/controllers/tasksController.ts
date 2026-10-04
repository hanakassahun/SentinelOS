import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../../services/prismaClient';
import { refreshInsights } from '../../services/insightService';

const taskPlanSchema = z.object({
  userId: z.string().trim().min(1).default('local-user'),
  type: z.string().trim().min(1).max(80).transform((value) => value.toLowerCase()),
  difficulty: z.number().int().min(1).max(5),
  plannedStart: z.string().datetime(),
  timezone: z.string().trim().min(1).max(100),
  cognitiveLoad: z.number().int().min(1).max(5).optional(),
  plannedMinutes: z.number().int().positive().max(1440).optional(),
  energyAtStart: z.number().int().min(1).max(10).optional(),
  moodAtStart: z.number().int().min(1).max(10).optional(),
  tags: z.array(z.string().trim().min(1).max(80)).max(10).default([]),
});

const taskCompletionSchema = z.object({
  actualStart: z.string().datetime().optional(),
  actualMinutes: z.number().int().positive().max(1440).optional(),
  outcome: z.enum(['SUCCESS', 'FAIL']),
});

function deriveLocalCalendar(start: Date, timezone: string) {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      hourCycle: 'h23',
      weekday: 'short',
    }).formatToParts(start);
  } catch {
    throw new Error('timezone must be a valid IANA timezone');
  }

  const hour = Number(parts.find((part) => part.type === 'hour')?.value);
  const weekdayLabel = parts.find((part) => part.type === 'weekday')?.value;
  const weekday = ({ Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 } as Record<string, number>)[weekdayLabel ?? ''];
  if (!Number.isInteger(hour) || weekday === undefined) {
    throw new Error('Could not derive local task time');
  }
  return { localHour: hour, localWeekday: weekday };
}

async function ensureUser(userId: string) {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: `${userId}@local.sentinel.invalid` },
  });
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  const parsed = taskPlanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid task payload', details: parsed.error.flatten() });
  }

  try {
    const input = parsed.data;
    const plannedStart = new Date(input.plannedStart);
    let localCalendar: ReturnType<typeof deriveLocalCalendar>;
    try {
      localCalendar = deriveLocalCalendar(plannedStart, input.timezone);
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid timezone' });
    }

    await ensureUser(input.userId);
    const task = await prisma.task.create({
      data: {
        userId: input.userId,
        type: input.type,
        difficulty: input.difficulty,
        plannedStart,
        timezone: input.timezone,
        ...localCalendar,
        cognitiveLoad: input.cognitiveLoad,
        plannedMinutes: input.plannedMinutes,
        energyAtStart: input.energyAtStart,
        moodAtStart: input.moodAtStart,
        tags: input.tags.length ? {
          create: input.tags.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { userId_name: { userId: input.userId, name: name.toLowerCase() } },
                create: { userId: input.userId, name: name.toLowerCase() },
              },
            },
          })),
        } : undefined,
      },
      include: { tags: { include: { tag: true } } },
    });

    res.status(201).json({ ...task, tags: task.tags.map((link) => link.tag.name) });
  } catch (error) {
    next(error);
  }
}

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = typeof req.query.userId === 'string' ? req.query.userId : 'local-user';
    await ensureUser(userId);
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: [{ outcome: 'asc' }, { plannedStart: 'asc' }],
      take: 100,
      include: { tags: { include: { tag: true } } },
    });
    res.json({ tasks: tasks.map((task) => ({
      ...task,
      tags: task.tags.map((link) => link.tag.name),
    })) });
  } catch (error) {
    next(error);
  }
}

export async function completeTask(req: Request, res: Response, next: NextFunction) {
  const parsed = taskCompletionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid task completion payload', details: parsed.error.flatten() });
  }

  try {
    const task = await prisma.task.update({
      where: { id: String(req.params.id) },
      data: {
        actualStart: parsed.data.actualStart ? new Date(parsed.data.actualStart) : undefined,
        actualMinutes: parsed.data.actualMinutes,
        outcome: parsed.data.outcome,
      },
    });

    const report = await refreshInsights(task.userId);
    res.json({ task, refreshedInsights: report.insights.length });
  } catch (error) {
    next(error);
  }
}
