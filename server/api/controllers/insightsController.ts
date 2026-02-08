import { Request, Response } from 'express';
import prisma from '../../services/prismaClient';
import { analyzeEnergy } from '../../../intelligence/energyAnalyzer';
import { generateEnergyInsights } from '../../../intelligence/insightGenerator';

// Simple in-memory cache for analysis/insights (per-process). Cached for 24h by default.
let cached: { ts: number; insights: any[]; analysis: any } | null = null;
let CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function getInsights(_req: Request, res: Response) {
  try {
    const now = Date.now();

    // Try DB-backed cached insight first (persisted cache)
    const force = _req.query && String(_req.query.force) === 'true';
    if (!force) {
      const persisted = await prisma.insight.findFirst({
        where: { behaviorType: 'ENERGY' },
        orderBy: { generatedAt: 'desc' },
      });
      if (persisted) {
        const age = now - persisted.generatedAt.getTime();
        if (age < CACHE_TTL_MS) {
          return res.json({ insights: persisted.insights, analysis: persisted.analysis, cached: true });
        }
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
          behaviorType: 'ENERGY',
          insights: [],
          analysis: { totalLogs: logs ? logs.length : 0 },
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
        behaviorType: 'ENERGY',
        insights,
        analysis,
      },
    });

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
    const { id } = req.params;
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
