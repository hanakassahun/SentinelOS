import { Request, Response } from 'express';
import prisma from '../../services/prismaClient';
import { getTimeBlockPerformance } from '../../services/insightService';

function formatLabel(hour: number) {
  const hh = hour.toString().padStart(2, '0');
  return `${hh}:00`;
}

function toShadowPoints(blocks: Awaited<ReturnType<typeof getTimeBlockPerformance>>) {
  return blocks.map((block) => ({
    hour: block.hourBlock,
    label: formatLabel(block.hourBlock),
    riskScore: block.successRate === null ? null : Math.round(100 - block.successRate),
    evidence: block.totalTasks === 0 ? 'insufficient data' : block.riskFlag ? 'high friction' : 'normal',
  }));
}

export async function getShadowSchedule(req: Request, res: Response) {
  try {
    const userId = String(req.query.userId || 'default');
    const points = toShadowPoints(await getTimeBlockPerformance(userId));

    res.json({ success: true, userId, points });
  } catch (err) {
    console.error('getShadowSchedule error', err);
    res.status(500).json({ error: 'Failed to compute shadow schedule' });
  }
}

export async function saveShadowSnapshot(req: Request, res: Response) {
  try {
    const userId = String(req.body?.userId || req.query.userId || 'default');
    let points = req.body?.points as any[] | undefined;

    if (!points) {
      points = toShadowPoints(await getTimeBlockPerformance(userId));
    }

    const saved = await prisma.insight.create({
      data: {
        userId,
        type: 'TIME_OF_DAY',
        dedupeKey: `SHADOW_SNAPSHOT:${new Date().toISOString().slice(0, 10)}`,
        message: 'Persisted shadow schedule snapshot',
        priority: 'LOW',
        sampleSize: points.reduce((total, point) => total + Number(point?.totalTasks ?? 0), 0),
        windowStart: null,
        windowEnd: null,
        status: 'NEW',
        evidence: points as any,
      },
    });

    res.json({ ok: true, saved });
  } catch (err) {
    console.error('saveShadowSnapshot error', err);
    res.status(500).json({ error: 'Failed to persist snapshot' });
  }
}
