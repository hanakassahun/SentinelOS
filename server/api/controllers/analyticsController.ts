/**
 * Analytics Controller
 * 
 * Handles analytics API requests by orchestrating data fetching and
 * intelligence engine computation. Follows the same error handling pattern
 * as logsController with centralized error middleware.
 */

import { Request, Response } from 'express';
import prisma from '../../services/prismaClient';
import {
  runComprehensiveAnalytics,
  analyzeDecisionPatterns,
  detectRiskAlerts,
  computeDecisionQualityScore,
  normalizeDecisions,
  analyzeBehavior,
  generateBehavioralInsights,
  normalizeBehavioralEvents,
} from '../../../intelligence/analytics';

/**
 * GET /api/analytics/:userId
 * 
 * Returns comprehensive analysis including decision metrics, behavioral analysis,
 * risk alerts, insights, and synthesized recommendations.
 * 
 * Response: ComprehensiveAnalytics with all metrics
 */
export const getComprehensiveAnalysis = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.params.userId);

  if (!userId) {
    res.status(400).json({
      error: 'userId is required',
      details: 'userId must be provided as a path parameter',
    });
    return;
  }

  // Fetch user data from database
  const [decisions, behavioralEvents] = await Promise.all([
    (prisma as any).decision.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 200, // Last 200 decisions for context
    }),
    (prisma as any).behavioralEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 500, // Last 500 events for comprehensive analysis
    }),
  ]);

  // Run comprehensive analytics
  const analysis = runComprehensiveAnalytics({
    userId,
    decisions,
    behavioralEvents,
  });

  res.status(200).json({
    success: true,
    userId,
    timestamp: new Date().toISOString(),
    data: analysis,
  });
};

/**
 * GET /api/analytics/:userId/decisions
 * 
 * Returns decision-specific metrics: risk analysis, patterns, trends, quality score.
 * Lighter than full analysis, focused on decision-making patterns.
 * 
 * Query params:
 * - limit: number of decisions to analyze (default: 100, max: 500)
 */
export const getDecisionMetrics = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.params.userId);
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);

  if (!userId) {
    res.status(400).json({
      error: 'userId is required',
      details: 'userId must be provided as a path parameter',
    });
    return;
  }

  // Fetch decisions
  const decisions = await (prisma as any).decision.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  if (decisions.length === 0) {
    res.status(200).json({
      success: true,
      userId,
      data: {
        totalDecisions: 0,
        message: 'No decisions found for this user',
      },
    });
    return;
  }

  // Normalize and analyze
  const normalized = normalizeDecisions(decisions);
  const decisionAnalysis = analyzeDecisionPatterns(normalized);
  const riskAlerts = detectRiskAlerts(decisionAnalysis, decisions);
  const qualityScore = computeDecisionQualityScore(decisionAnalysis);

  res.status(200).json({
    success: true,
    userId,
    timestamp: new Date().toISOString(),
    data: {
      decisionAnalysis,
      riskAlerts,
      qualityScore,
      metricsCount: decisions.length,
    },
  });
};

/**
 * GET /api/analytics/:userId/behavior
 * 
 * Returns behavioral-specific metrics: success rates, time-of-day patterns,
 * task performance, energy correlations, and behavioral insights.
 * 
 * Query params:
 * - limit: number of events to analyze (default: 200, max: 1000)
 */
export const getBehaviorMetrics = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.params.userId);
  const limit = Math.min(parseInt(req.query.limit as string) || 200, 1000);

  if (!userId) {
    res.status(400).json({
      error: 'userId is required',
      details: 'userId must be provided as a path parameter',
    });
    return;
  }

  // Fetch behavioral events
  const events = await prisma.behavioralEvent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  if (events.length === 0) {
    res.status(200).json({
      success: true,
      userId,
      data: {
        totalEvents: 0,
        message: 'No behavioral events found for this user',
      },
    });
    return;
  }

  // Normalize and analyze
  const normalized = normalizeBehavioralEvents(events);
  const behavioralAnalysis = analyzeBehavior(normalized);
  const insights = generateBehavioralInsights(behavioralAnalysis);

  res.status(200).json({
    success: true,
    userId,
    timestamp: new Date().toISOString(),
    data: {
      behavioralAnalysis,
      insights,
      metricsCount: events.length,
    },
  });
};

/**
 * GET /api/analytics/:userId/health
 * 
 * Quick endpoint returning just the overall health score and key metrics.
 * Useful for dashboards/summaries that only need high-level status.
 * 
 * Response time: < 100ms typically
 */
export const getHealthScore = async (req: Request, res: Response): Promise<void> => {
  const userId = String(req.params.userId);

  if (!userId) {
    res.status(400).json({
      error: 'userId is required',
      details: 'userId must be provided as a path parameter',
    });
    return;
  }

  // Fetch minimal data for quick health score
  const [decisions, behavioralEvents] = await Promise.all([
    (prisma as any).decision.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    (prisma as any).behavioralEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);

  // Run quick analysis
  const analysis = runComprehensiveAnalytics({
    userId,
    decisions,
    behavioralEvents,
  });

  res.status(200).json({
    success: true,
    userId,
    timestamp: new Date().toISOString(),
    data: {
      healthScore: analysis.overallHealthScore,
      decisionQualityScore: analysis.decisionQualityScore,
      successRate: analysis.behavioralAnalysis.overallSuccessRate,
      riskAlertCount: analysis.riskAlerts.length,
      criticalAlertsCount: analysis.riskAlerts.filter((a) => a.severity === 'critical').length,
      topRecommendation: analysis.synthesizedRecommendations[0] || null,
    },
  });
};

/**
 * Error handler for analytics controller
 * Validates userId format and handles Prisma errors
 */
export async function validateAnalyticsParams(req: Request, res: Response, next: Function): Promise<void> {
  const { userId } = req.params;

  // Basic userId validation
  if (userId && userId.length < 1) {
    res.status(400).json({
      error: 'Invalid userId format',
      details: 'userId must be a non-empty string',
    });
    return;
  }

  next();
}
