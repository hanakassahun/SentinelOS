import { Request, Response } from 'express';
import prisma from '../../services/prismaClient';

export async function createLog(req: Request, res: Response) {
  try {
    const {
      userId = 'anonymous',
      behaviorType,
      value,
      expectedValue,
      timestamp,
      timezone,
      tags,
      note,
    } = req.body;

    if (!behaviorType || typeof value === 'undefined') {
      return res.status(400).json({ error: 'behaviorType and value are required' });
    }

    const data: any = {
      userId,
      behaviorType,
      value: Number(value),
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      timezone,
      note,
    };

    if (expectedValue !== undefined) data.expectedValue = Number(expectedValue);

    if (Array.isArray(tags) && tags.length > 0) {
      data.tags = {
        create: tags.map((name: string) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      };
    }

    const created = await prisma.log.create({
      data,
      include: { tags: { include: { tag: true } } },
    });

    const result = {
      ...created,
      tags: created.tags.map((lt: any) => lt.tag.name),
    };

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create log' });
  }
}

export async function listLogs(_req: Request, res: Response) {
  try {
    const logs = await prisma.log.findMany({
      orderBy: { timestamp: 'desc' },
      include: { tags: { include: { tag: true } } },
    });

    const result = logs.map((l) => ({
      ...l,
      tags: l.tags.map((lt: any) => lt.tag.name),
    }));

    res.json({ logs: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list logs' });
  }
}
