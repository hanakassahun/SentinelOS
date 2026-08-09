import { Request, Response } from 'express';
import prisma from '../../services/prismaClient';
import { calculateTimeBlockSuccess } from '../../intelligence/correlator';

function formatLabel(hour: number) {
  const hh = hour.toString().padStart(2, '0');
  return `${hh}:00`;
}

export async function getShadowSchedule(req: Request, res: Response) {
  try {
    const userId = String(req.query.userId || 'default');
    const blocks = await calculateTimeBlockSuccess(userId);

    const points = blocks.map((b) => ({
      hour: b.hourBlock,
      label: formatLabel(b.hourBlock),
      riskScore: Math.round(100 - b.successRate),
      evidence: b.riskFlag ? 'high friction' : 'normal',
    }));

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
      const blocks = await calculateTimeBlockSuccess(userId);
      points = blocks.map((b) => ({ hour: b.hourBlock, label: formatLabel(b.hourBlock), riskScore: Math.round(100 - b.successRate), evidence: b.riskFlag ? 'high friction' : 'normal' }));
    }

    const saved = await prisma.insight.create({
      data: {
        userId,
        type: 'SHADOW_SNAPSHOT',
        message: 'Persisted shadow schedule snapshot',
        priority: 'low',
        insights: points as any,
        analysis: { generatedAt: new Date().toISOString() } as any,
      },
    });

    res.json({ ok: true, saved });
  } catch (err) {
    console.error('saveShadowSnapshot error', err);
    res.status(500).json({ error: 'Failed to persist snapshot' });
  }
}
