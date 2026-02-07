import { Request, Response } from 'express';
import { computeSuccessRate } from '../../../intelligence/pattern-engine/successRate';
import { generateInsights } from '../../../intelligence/insight-generator/generateInsights';

export async function getInsights(_req: Request, res: Response) {
  try {
    // In a real implementation we'd load events from the DB (Prisma)
    const events: any[] = [];
    const analysis = computeSuccessRate(events);
    const insights = generateInsights(analysis);
    res.json({ insights });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
}
