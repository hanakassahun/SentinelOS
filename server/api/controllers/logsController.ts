import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../services/prismaClient';

type LogCreatePayload = {
  userId: string;
  behaviorType: 'ENERGY' | 'MOOD';
  value: number;
  expectedValue?: number;
  timestamp: Date;
  timezone?: string;
  tags: string[];
  note?: string;
};

const VALID_BEHAVIOR_TYPES = new Set(['ENERGY', 'MOOD']);
const MAX_NOTE_LENGTH = 1000;
const MAX_TAGS = 10;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeBehaviorType(value: unknown): 'ENERGY' | 'MOOD' | null {
  if (typeof value !== 'string') return null;

  const normalized = value.trim().toUpperCase();
  return VALID_BEHAVIOR_TYPES.has(normalized) ? (normalized as 'ENERGY' | 'MOOD') : null;
}

function parseInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) return Number(value);
  return null;
}

function sanitizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const tag of value) {
    if (typeof tag !== 'string') continue;

    const trimmed = tag.trim();
    const normalized = trimmed.toLowerCase();

    if (!trimmed || seen.has(normalized) || tags.length >= MAX_TAGS) continue;

    seen.add(normalized);
    tags.push(trimmed);
  }

  return tags;
}

function validateCreateLogPayload(body: unknown) {
  if (!isPlainObject(body)) {
    return {
      ok: false as const,
      errors: ['Request body must be a JSON object.'],
    };
  }

  const errors: string[] = [];

  let userId = 'anonymous';
  if (body.userId !== undefined) {
    if (typeof body.userId !== 'string' || body.userId.trim().length === 0) {
      errors.push('userId must be a non-empty string when provided.');
    } else {
      userId = body.userId.trim();
    }
  }

  const behaviorType = normalizeBehaviorType(body.behaviorType);
  if (!behaviorType) {
    errors.push('behaviorType is required and must be either ENERGY or MOOD.');
  }

  const value = parseInteger(body.value);
  if (value === null) {
    errors.push('value is required and must be an integer.');
  }

  let expectedValue: number | undefined;
  if (body.expectedValue !== undefined) {
    const parsed = parseInteger(body.expectedValue);
    if (parsed === null) {
      errors.push('expectedValue must be an integer when provided.');
    } else {
      expectedValue = parsed;
    }
  }

  let timestamp = new Date();
  if (body.timestamp !== undefined && body.timestamp !== null && body.timestamp !== '') {
    timestamp = new Date(body.timestamp as string | number | Date);
    if (Number.isNaN(timestamp.getTime())) {
      errors.push('timestamp must be a valid date string.');
    }
  }

  if (body.timezone !== undefined && body.timezone !== null && typeof body.timezone !== 'string') {
    errors.push('timezone must be a string when provided.');
  }

  let note: string | undefined;
  if (body.note !== undefined && body.note !== null) {
    if (typeof body.note !== 'string') {
      errors.push('note must be a string when provided.');
    } else if (body.note.length > MAX_NOTE_LENGTH) {
      errors.push(`note must be ${MAX_NOTE_LENGTH} characters or fewer.`);
    } else {
      note = body.note;
    }
  }

  if (body.tags !== undefined && body.tags !== null && !Array.isArray(body.tags)) {
    errors.push('tags must be an array of strings when provided.');
  }

  const tags = sanitizeTags(body.tags);

  if (errors.length > 0) {
    return {
      ok: false as const,
      errors,
    };
  }

  return {
    ok: true as const,
    data: {
      userId,
      behaviorType: behaviorType as 'ENERGY' | 'MOOD',
      value: value as number,
      expectedValue,
      timestamp,
      timezone: typeof body.timezone === 'string' ? body.timezone : undefined,
      tags,
      note,
    } satisfies LogCreatePayload,
  };
}

export async function createLog(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = validateCreateLogPayload(req.body);

    if (!validation.ok) {
      return res.status(400).json({ error: 'Invalid log payload', details: validation.errors });
    }

    const payload = validation.data;

    const data: Record<string, unknown> = {
      userId: payload.userId,
      behaviorType: payload.behaviorType,
      value: payload.value,
      timestamp: payload.timestamp,
      timezone: payload.timezone,
      note: payload.note,
    };

    if (payload.expectedValue !== undefined) {
      data.expectedValue = payload.expectedValue;
    }

    if (payload.tags.length > 0) {
      data.tags = {
        create: payload.tags.map((name) => ({
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
      data: data as any,
      include: { tags: { include: { tag: true } } },
    });

    const result = {
      ...created,
      tags: created.tags.map((tagLink: any) => tagLink.tag.name),
    };

    res.status(201).json(result);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(409).json({ error: 'A conflicting record already exists.' });
      }
      if (err.code === 'P2025') {
        return res.status(400).json({ error: 'Referenced record was not found.' });
      }
    }

    next(err);
  }
}

export async function listLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const rawLimit = req.query.limit;
    const parsedLimit = typeof rawLimit === 'string' ? Number(rawLimit) : 50;
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(Math.floor(parsedLimit), 100) : 50;

    const logs = await prisma.log.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: { tags: { include: { tag: true } } },
    });

    const result = logs.map((log) => ({
      ...log,
      tags: log.tags.map((tagLink: any) => tagLink.tag.name),
    }));

    res.json({ logs: result });
  } catch (err) {
    next(err);
  }
}
