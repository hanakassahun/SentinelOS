import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../services/prismaClient';

const checkInSchema = z.object({
  userId: z.string().trim().min(1).default('local-user'),
  kind: z.enum(['ENERGY', 'MOOD']),
  value: z.number().int().min(1).max(10),
  predictedValue: z.number().int().min(1).max(10).optional(),
  timestamp: z.string().datetime().optional(),
  timezone: z.string().trim().min(1).max(100).optional(),
  note: z.string().max(1000).optional(),
  tags: z.array(z.string().trim().min(1).max(80)).max(10).default([]),
});

async function ensureUser(userId: string) {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: `${userId}@local.sentinel.invalid` },
  });
}

export async function createLog(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = checkInSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid check-in payload', details: parsed.error.flatten() });
    }

    const input = parsed.data;
    await ensureUser(input.userId);
    const created = await prisma.checkIn.create({
      data: {
        userId: input.userId,
        kind: input.kind,
        value: input.value,
        predictedValue: input.predictedValue,
        timestamp: input.timestamp ? new Date(input.timestamp) : new Date(),
        timezone: input.timezone,
        note: input.note,
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

    res.status(201).json({
      ...created,
      tags: created.tags.map((link) => link.tag.name),
    });
  } catch (error) {
    next(error);
  }
}

export async function listLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = typeof req.query.userId === 'string' ? req.query.userId : 'local-user';
    const limitValue = typeof req.query.limit === 'string' ? Number(req.query.limit) : 50;
    const take = Number.isFinite(limitValue) && limitValue > 0 ? Math.min(Math.floor(limitValue), 100) : 50;
    const checkIns = await prisma.checkIn.findMany({
      where: { userId },
      take,
      orderBy: { timestamp: 'desc' },
      include: { tags: { include: { tag: true } } },
    });

    res.json({ checkIns: checkIns.map((checkIn) => ({
      ...checkIn,
      tags: checkIn.tags.map((link) => link.tag.name),
    })) });
  } catch (error) {
    next(error);
  }
}
