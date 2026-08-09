import { Request, Response } from 'express';
import prisma from '../../services/prismaClient';
import { analyzeEnergy } from '../../../intelligence/energyAnalyzer';
import { generateEnergyInsights } from '../../../intelligence/insightGenerator';
import { getLogs } from '../../services/insightsService';
import { generateInsightsFromLogs } from '../../../internal/intelligence/insightGenerator';
import {
  buildInsightsFromAnalytics,
  getBehaviorAnalytics,
} from '../../services/analyticsService';
import { insightQueue } from '../../queues/insightQueue';
import { getCachedInsights, invalidateCachedInsights } from '../../services/cachedInsights';

// Simple in-memory cache for analysis/insights (per-process). Cached for 24h by default.
let cached: { ts: number; insights: any[]; analysis: any } | null = null;
let CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function getInsights(req: Request, res: Response) {
  try {
    const now = Date.now();
    const force = req.query && String(req.query.force) === 'true';
    const userId = String(req.query.userId || 'default');

    if (!force) {
      const cached = await getCachedInsights(userId);
      if (cached) {
        return res.json({
          insights: cached.insights,
          analysis: cached.analysis,
          cached: true,
          generatedAt: cached.generatedAt.toISOString(),
        });
      }
    }

    // Fetch recent energy logs (last 30 days), ensure ordering by createdAt in DB
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const logs = await prisma.log.findMany({
      where: { behaviorType: 'ENERGY', timestamp: { gte: since } },
      orderBy: { createdAt: 'asc' },
    });

    // Minimum data guard
    if (!logs || logs.length < 5) {
      // persist empty result briefly to avoid repeated cheap requests
      await prisma.insight.create({
        data: {
          type: 'TREND',
          message: 'Cached empty insight result',
          priority: 'low',
          insights: [] as any,
          analysis: { totalLogs: logs ? logs.length : 0 } as any,
        },
      });
      cached = { ts: Date.now(), insights: [], analysis: { totalLogs: logs ? logs.length : 0 } };
      return res.json({ insights: [], analysis: cached.analysis });
    }

    const energyLogs = logs.map((l) => ({ value: l.value, timestamp: l.timestamp.toISOString() }));
    const analysis = analyzeEnergy(energyLogs);
    const insights = generateEnergyInsights(analysis);

    // Persist generated insights (cache)
    await prisma.insight.create({
      data: {
        userId,
        type: 'TREND',
        message: 'Cached generated energy insights',
        priority: 'low',
        insights: insights as any,
        analysis: analysis as any,
      },
    });
    invalidateCachedInsights(userId);

    // Update in-process cache
    cached = { ts: Date.now(), insights, analysis };
    res.json({ insights, analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate insights' });
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

export async function refreshInsights(_req: Request, res: Response) {
  try {
    // call getInsights with force=true behavior: recompute and persist
    // We simulate by clearing in-memory cache and calling generator path
    cached = null;
    const fakeReq = { query: { force: 'true' } } as any;
    // reuse existing function to recompute
    return await getInsights(fakeReq, res as any);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to refresh insights' });
  }
}

export async function triggerInsightQueue(req: Request, res: Response) {
  try {
    const userId = String(req.body?.userId || req.query.userId || '');

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    invalidateCachedInsights(userId);
    await insightQueue.add('generate', { userId });
    res.json({ ok: true, queued: true, userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to queue insight generation' });
  }
}

export async function getInsightsSimple(_req: Request, res: Response) {
  try {
    const sinceAnalytics = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const analytics = await getBehaviorAnalytics({ behaviorType: 'ENERGY', since: sinceAnalytics });
    const insights = buildInsightsFromAnalytics(analytics);

    const recentSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = await prisma.log.findMany({
      where: { behaviorType: 'ENERGY', timestamp: { gte: recentSince } },
      orderBy: { timestamp: 'asc' },
    });

    const report = {
      analysis: analytics,
      insights,
      explainableGuidance: insights.map((item) => ({ message: item.message })),
      weeklyRecommendations: [],
      logs: recentLogs,
    };

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate simple insights' });
  }
}
