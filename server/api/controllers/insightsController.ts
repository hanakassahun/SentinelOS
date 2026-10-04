import { Request, Response } from 'express';
import prisma from '../../services/prismaClient';
import { enqueueInsightGeneration } from '../../queues/insightQueue';
import { getBehavioralInsightReport, refreshInsights as persistInsights } from '../../services/insightService';

function toInsightResponse(report: Awaited<ReturnType<typeof getBehavioralInsightReport>>) {
  return {
    insights: report.insights.map((insight) => ({
      type: insight.type,
      message: insight.title,
      description: insight.description,
      recommendation: insight.actionable,
      metric: insight.metric,
      priority: insight.priority,
    })),
    analysis: report.analysis,
    timeBlocks: report.timeBlocks,
  };
}

export async function getInsights(req: Request, res: Response) {
  try {
    const userId = String(req.query.userId || 'default');
    const report = String(req.query.force) === 'true'
      ? await persistInsights(userId)
      : await getBehavioralInsightReport(userId);

    res.json(toInsightResponse(report));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate behavioral insights' });
  }
}

export async function listPersistedInsights(_req: Request, res: Response) {
  try {
    const rows = await prisma.insight.findMany({ orderBy: { generatedAt: 'desc' }, take: 50 });
    res.json({ insights: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list persisted insights' });
  }
}

export async function deleteInsight(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    await prisma.insight.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete insight' });
  }
}

export async function refreshInsights(req: Request, res: Response) {
  try {
    const userId = String(req.body?.userId || req.query.userId || 'default');
    const report = await persistInsights(userId);
    res.json(toInsightResponse(report));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to refresh behavioral insights' });
  }
}

export async function triggerInsightQueue(req: Request, res: Response) {
  try {
    const userId = String(req.body?.userId || req.query.userId || 'default');

    const result = await enqueueInsightGeneration(userId);
    res.json({ ok: true, userId, ...result });
  } catch (err) {
    console.error('Failed to enqueue insight generation', err);
    res.status(503).json({ error: 'Insight queue unavailable' });
  }
}

export async function getInsightsSimple(req: Request, res: Response) {
  try {
    const userId = String(req.query.userId || 'default');
    const report = await getBehavioralInsightReport(userId);
    const response = toInsightResponse(report);
    const logs = report.checkIns
      .filter((checkIn) => checkIn.kind === 'ENERGY')
      .map((checkIn) => ({
        value: checkIn.value,
        timestamp: checkIn.timestamp,
      }));

    res.json({
      analysis: response.analysis,
      insights: response.insights,
      timeBlocks: response.timeBlocks,
      explainableGuidance: response.insights.map((item) => ({ message: item.message })),
      weeklyRecommendations: [],
      logs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate simple insights' });
  }
}
