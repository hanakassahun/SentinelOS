import { Prisma } from '@prisma/client';
import prisma from './prismaClient';

const TIME_BLOCKS = [
  { label: 'Night', start: 0, end: 6 },
  { label: 'Morning', start: 6, end: 12 },
  { label: 'Afternoon', start: 12, end: 17 },
  { label: 'Evening', start: 17, end: 21 },
  { label: 'Late', start: 21, end: 24 },
];

type SqlProvider = 'sqlite' | 'postgres';

export interface TimeBlockStat {
  label: string;
  total: number;
  successes: number;
  successRate: number | null;
}

export interface FailureCluster {
  start: string;
  end: string;
  count: number;
  durationHours: number;
}

export interface InsightAnalytics {
  totalEvents: number;
  totalSuccesses: number;
  totalFailures: number;
  overallSuccessRate: number | null;
  timeBlockStats: TimeBlockStat[];
  topTimeBlock: {
    label: string;
    successRate: number;
    advantagePercent: number;
  } | null;
  failureClusters: FailureCluster[];
}

function getSqlProvider(): SqlProvider {
  const url = process.env.DATABASE_URL ?? '';
  return url.startsWith('postgres://') || url.startsWith('postgresql://') ? 'postgres' : 'sqlite';
}

function getHourExpression(provider: SqlProvider): string {
  if (provider === 'postgres') {
    return 'EXTRACT(hour FROM "timestamp")';
  }
  return 'CAST(strftime(\'%H\', "timestamp") AS INTEGER)';
}

function getDateBucketExpression(provider: SqlProvider): string {
  if (provider === 'postgres') {
    return 'TO_CHAR("timestamp", \'YYYY-MM-DD\')';
  }
  return 'strftime(\'%Y-%m-%d\', "timestamp")';
}

function buildTagFilter(tagNames?: string[]) {
  if (!tagNames || tagNames.length === 0) {
    return { clause: '', params: [] as string[] };
  }

  const placeholders = tagNames.map(() => '?').join(', ');
  return {
    clause: `AND EXISTS (
      SELECT 1
      FROM "LogTag" lt
      JOIN "Tag" t ON t.id = lt."tagId"
      WHERE lt."logId" = "Log".id
        AND t.name IN (${placeholders})
    )`,
    params: tagNames,
  };
}

export async function getBehaviorAnalytics(options: {
  userId?: string;
  behaviorType?: string;
  since?: Date;
  tagNames?: string[];
  minFailureClusterSize?: number;
} = {}): Promise<InsightAnalytics> {
  const {
    userId,
    behaviorType = 'ENERGY',
    since,
    tagNames,
    minFailureClusterSize = 2,
  } = options;

  const provider = getSqlProvider();
  const hourExpr = getHourExpression(provider);
  const dayBucket = getDateBucketExpression(provider);

  const tagFilter = buildTagFilter(tagNames);
  const whereFragments = [
    `"behaviorType" = ?`,
    `"outcome" IN ('success', 'fail')`,
  ];
  const params: (string | number)[] = [behaviorType];

  if (userId) {
    whereFragments.push(`"userId" = ?`);
    params.push(userId);
  }

  if (since) {
    whereFragments.push(`"timestamp" >= ?`);
    params.push(since.toISOString());
  }

  if (tagFilter.clause) {
    whereFragments.push(tagFilter.clause);
    params.push(...tagFilter.params);
  }

  const whereClause = whereFragments.join(' AND ');

  const timeBlockSql = `
      SELECT
        CASE
          WHEN ${hourExpr} >= 0 AND ${hourExpr} < 6 THEN 'Night'
          WHEN ${hourExpr} >= 6 AND ${hourExpr} < 12 THEN 'Morning'
          WHEN ${hourExpr} >= 12 AND ${hourExpr} < 17 THEN 'Afternoon'
          WHEN ${hourExpr} >= 17 AND ${hourExpr} < 21 THEN 'Evening'
          ELSE 'Late'
        END AS "timeBlock",
        COUNT(*) AS "total",
        SUM(CASE WHEN "outcome" = 'success' THEN 1 ELSE 0 END) AS "successes"
      FROM "Log"
      WHERE ${whereClause}
      GROUP BY "timeBlock"
      ORDER BY "total" DESC
    `;

  const timeBlockRows = await prisma.$queryRawUnsafe<Array<{ timeBlock: string; total: number; successes: number }>>(
    timeBlockSql,
    ...params,
  );

  const clusterSql = `
      SELECT
        ${dayBucket} AS "day",
        COUNT(*) AS "count",
        MIN("timestamp") AS "start",
        MAX("timestamp") AS "end"
      FROM "Log"
      WHERE ${whereClause}
        AND "outcome" = 'fail'
      GROUP BY "day"
      HAVING COUNT(*) >= ?
      ORDER BY "count" DESC, "day" DESC
      LIMIT 5
    `;

  const clusterRows = await prisma.$queryRawUnsafe<Array<{ day: string; count: number; start: string; end: string }>>(
    clusterSql,
    ...params,
    minFailureClusterSize,
  );

  const timeBlockStats = TIME_BLOCKS.map((block) => {
    const row = timeBlockRows.find((r) => r.timeBlock === block.label);
    const total = row?.total ?? 0;
    const successes = row?.successes ?? 0;
    return {
      label: block.label,
      total,
      successes,
      successRate: total > 0 ? Number(((successes / total) * 100).toFixed(1)) : null,
    };
  });

  const outcomeTotals = timeBlockStats.reduce(
    (acc, block) => {
      acc.total += block.total;
      acc.successes += block.successes;
      return acc;
    },
    { total: 0, successes: 0 },
  );

  const sortedBlocks = timeBlockStats
    .filter((block) => block.total > 0 && block.successRate !== null)
    .sort((a, b) => (b.successRate ?? 0) - (a.successRate ?? 0));

  const topTimeBlock = sortedBlocks.length > 0 ? sortedBlocks[0] : null;
  const secondBest = sortedBlocks.length > 1 ? sortedBlocks[1] : null;
  const advantagePercent = topTimeBlock && secondBest
    ? Math.round(((topTimeBlock.successRate ?? 0) - (secondBest.successRate ?? 0)) / (secondBest.successRate || 1) * 100)
    : 0;

  const failureClusters = clusterRows.map((row) => {
    const start = new Date(row.start).toISOString();
    const end = new Date(row.end).toISOString();
    const durationHours = Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60));
    return {
      start,
      end,
      count: Number(row.count),
      durationHours: Number(durationHours.toFixed(1)),
    };
  });

  return {
    totalEvents: outcomeTotals.total,
    totalSuccesses: outcomeTotals.successes,
    totalFailures: outcomeTotals.total - outcomeTotals.successes,
    overallSuccessRate: outcomeTotals.total > 0 ? Number(((outcomeTotals.successes / outcomeTotals.total) * 100).toFixed(1)) : null,
    timeBlockStats,
    topTimeBlock: topTimeBlock
      ? {
          label: topTimeBlock.label,
          successRate: topTimeBlock.successRate ?? 0,
          advantagePercent,
        }
      : null,
    failureClusters,
  };
}

export function buildInsightsFromAnalytics(analytics: InsightAnalytics) {
  const insights: Array<{ type: string; message: string; priority: 'low' | 'medium' | 'high' }> = [];

  if (analytics.topTimeBlock && analytics.topTimeBlock.advantagePercent > 10) {
    insights.push({
      type: 'TIME_OF_DAY',
      priority: 'high',
      message: `You complete this behavior ${analytics.topTimeBlock.advantagePercent}% more often during ${analytics.topTimeBlock.label}.`,
    });
  }

  if (analytics.overallSuccessRate !== null) {
    const quality = analytics.overallSuccessRate >= 75 ? 'strong' : analytics.overallSuccessRate >= 50 ? 'moderate' : 'weak';
    insights.push({
      type: 'TREND',
      priority: analytics.overallSuccessRate >= 75 ? 'medium' : 'low',
      message: `Your overall success rate is ${analytics.overallSuccessRate}%, which is ${quality}.`,
    });
  }

  analytics.failureClusters.forEach((cluster) => {
    insights.push({
      type: 'SUDDEN_DROP',
      priority: 'high',
      message: `Failure cluster detected: ${cluster.count} failed events between ${new Date(cluster.start).toLocaleString()} and ${new Date(cluster.end).toLocaleString()}.`,
    });
  });

  if (insights.length === 0) {
    insights.push({
      type: 'AVERAGE',
      priority: 'low',
      message: 'Not enough structured outcome data yet to generate a pattern-based insight.',
    });
  }

  return insights;
}
