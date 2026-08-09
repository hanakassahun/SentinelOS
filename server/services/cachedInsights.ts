import prisma from './prismaClient';

const CACHE_TTL_MS = 60 * 60 * 1000;

interface CachedInsightRecord {
  id: string;
  type: string;
  message: string;
  recommendation?: string | null;
  priority: string;
  confidence?: number | null;
  insights: unknown;
  analysis: unknown;
  generatedAt: Date;
}

const inMemoryCache = new Map<string, { expiresAt: number; payload: CachedInsightRecord }>();

export async function getCachedInsights(userId: string) {
  const now = Date.now();
  const key = `insights:${userId}`;
  const memoryHit = inMemoryCache.get(key);
  if (memoryHit && memoryHit.expiresAt > now) {
    return memoryHit.payload;
  }

  const latest = await prisma.insight.findFirst({
    where: { userId },
    orderBy: { generatedAt: 'desc' },
  });

  if (latest && latest.generatedAt.getTime() > now - CACHE_TTL_MS) {
    const payload = latest as unknown as CachedInsightRecord;
    inMemoryCache.set(key, { expiresAt: now + CACHE_TTL_MS, payload });
    return payload;
  }

  return null;
}

export function invalidateCachedInsights(userId: string) {
  inMemoryCache.delete(`insights:${userId}`);
}
