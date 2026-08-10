/**
 * Analytics Integration Examples
 * 
 * Demonstrates how to use the analytics engine with real Prisma data
 * and integrate results into the application.
 */

import { runComprehensiveAnalytics, generateExecutiveSummary } from './analyticsOrchestrator';
import { analyzeDecisionPatterns, detectRiskAlerts } from './decisionAnalyzer';
import { analyzeBehavior, generateBehavioralInsights } from './behavioralAnalyzer';
import type { ComprehensiveAnalytics } from './analyticsOrchestrator';
import prisma from '../../services/prismaClient';

/**
 * Example 1: Generate insights for a user
 * 
 * Fetches all data for a user and runs comprehensive analytics.
 * Suitable for dashboards, reports, or periodic analysis.
 */
export async function generateUserInsights(userId: string): Promise<ComprehensiveAnalytics> {
  console.log(`📊 Generating insights for user: ${userId}`);

  // Fetch data
  const [decisions, behavioralEvents] = await Promise.all([
    prisma.decision.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100, // Last 100 decisions
    }),
    prisma.behavioralEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 500, // Last 500 events
    }),
  ]);

  // Run analytics
  const analytics = runComprehensiveAnalytics({
    userId,
    decisions,
    behavioralEvents,
  });

  console.log('✅ Analysis complete');
  console.log(generateExecutiveSummary(analytics));

  return analytics;
}

/**
 * Example 2: Store analytics results for trending
 * 
 * Runs analytics and stores results in database for historical tracking
 */
export async function storeAnalyticsSnapshot(userId: string): Promise<void> {
  const analytics = await generateUserInsights(userId);

  // Store recommendations as insights in database
  for (const rec of analytics.synthesizedRecommendations) {
    await prisma.insight.create({
      data: {
        userId,
        // Use existing InsightType enum values; store recommendations under AVERAGE
        type: 'AVERAGE',
        message: rec.title,
        recommendation: rec.description,
        priority: rec.priority,
        analysis: {
          category: rec.category,
          actionItems: rec.actionItems,
          estimatedImpact: rec.estimatedImpact,
          timeframe: rec.timeframe,
        },
        insights: {
          healthScore: analytics.overallHealthScore,
          decisionQualityScore: analytics.decisionQualityScore,
          successRate: analytics.behavioralAnalysis.overallSuccessRate,
        },
      },
    });
  }

  // Store risk alerts
  for (const alert of analytics.riskAlerts) {
    await prisma.insight.create({
      data: {
        userId,
        // Map risk alerts to TREND InsightType
        type: 'TREND',
        message: alert.message,
        recommendation: alert.recommendation,
        priority: alert.severity === 'critical' ? 'high' : alert.severity === 'high' ? 'high' : 'medium',
        analysis: {
          severity: alert.severity,
          reason: alert.reason,
          confidence: alert.confidence,
          affectedDecisions: alert.affectedDecisions,
        },
        // prisma requires 'insights' Json field; provide empty object when none
        insights: {},
      },
    });
  }

  console.log(`💾 Analytics snapshot stored for user: ${userId}`);
}

/**
 * Example 3: Real-time decision risk assessment
 * 
 * Quick analysis when a user makes a decision to provide immediate feedback
 */
export async function assessDecisionRisk(userId: string, decision: any): Promise<{
  riskScore: number;
  riskLevel: string;
  alerts: string[];
  recommendation: string;
}> {
  // Get recent decisions to establish context
  const recentDecisions = await prisma.decision.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const allDecisions = [decision, ...recentDecisions];
  const analysis = analyzeDecisionPatterns(
    allDecisions.map((d) => ({
      id: d.id,
      riskScore: d.riskScore,
      riskLevel: d.riskLevel,
      description: d.description,
      tags: d.tags ? d.tags.split(',') : [],
      createdAt: new Date(d.createdAt),
    })),
  );

  const alerts = detectRiskAlerts(analysis, allDecisions);

  let recommendation = 'Proceed with standard caution.';
  if (decision.riskScore > 70) {
    recommendation = 'High risk detected. Consider consulting with advisors or delaying this decision.';
  } else if (decision.riskScore > 50) {
    recommendation = 'Moderate risk. Document your assumptions and success criteria.';
  }

  return {
    riskScore: decision.riskScore,
    riskLevel: decision.riskLevel,
    alerts: alerts.slice(0, 2).map((a) => a.message),
    recommendation,
  };
}

/**
 * Example 4: Identify user's peak performance periods
 * 
 * Useful for helping users schedule important tasks optimally
 */
export async function identifyPeakPerformancePeriods(userId: string): Promise<{
  bestTimeBlock: string;
  bestTaskType: string;
  recommendations: string[];
}> {
  const events = await prisma.behavioralEvent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const analysis = analyzeBehavior(
    events.map((e) => ({
      id: e.id,
      userId: e.userId,
      taskType: e.taskType || 'unknown',
      plannedTime: e.plannedTime?.toISOString(),
      executedTime: e.executedTime?.toISOString(),
      energyLevel: e.energyLevel as any,
      moodLevel: e.moodLevel as any,
      difficulty: e.difficulty,
      outcome: e.outcome as any,
      createdAt: e.createdAt.toISOString(),
    })),
  );

  const recommendations: string[] = [];

  if (analysis.bestPerformingTimeBlock) {
    recommendations.push(
      `Schedule important work during ${analysis.bestPerformingTimeBlock.label} ` +
      `(${analysis.bestPerformingTimeBlock.successRate}% success rate)`,
    );
  }

  if (analysis.taskTypeStats.length > 0) {
    const best = analysis.taskTypeStats[0];
    recommendations.push(
      `You excel at ${best.taskType} tasks (${best.successRate}% success). ` +
      `Delegate or learn from this strength.`,
    );
  }

  if (analysis.energyOutcomeCorrelation && analysis.energyOutcomeCorrelation > 0.5) {
    recommendations.push('Energy is critical to your success. Prioritize sleep and exercise.');
  }

  return {
    bestTimeBlock: analysis.bestPerformingTimeBlock?.label || 'Unknown',
    bestTaskType: analysis.taskTypeStats[0]?.taskType || 'Unknown',
    recommendations,
  };
}

/**
 * Example 5: Generate personalized coaching advice
 * 
 * Combines multiple analytics to provide holistic recommendations
 */
export async function generateCoachingAdvice(userId: string): Promise<string> {
  const analytics = await generateUserInsights(userId);
  const lines: string[] = [];

  lines.push('=== 🎯 Personalized Coaching Advice ===\n');

  // Overall health
  const rating = analytics.overallHealthScore > 75 ? 'Excellent' : analytics.overallHealthScore > 50 ? 'Good' : 'Needs attention';
  lines.push(`📊 Overall Performance: ${rating} (${analytics.overallHealthScore}/100)\n`);

  // Decision quality
  lines.push(`🎯 Decision Quality: ${analytics.decisionQualityScore}/100`);
  if (analytics.decisionAnalysis.decisionMomentum === 'improving') {
    lines.push('   ✅ Your decision-making is improving. Keep up the good work!');
  } else if (analytics.decisionAnalysis.decisionMomentum === 'declining') {
    lines.push('   ⚠️  Your decision quality is declining. Slow down and seek input.');
  }
  lines.push('');

  // Success rate
  lines.push(`✅ Success Rate: ${analytics.behavioralAnalysis.overallSuccessRate}%`);
  if (analytics.behavioralAnalysis.overallSuccessRate > 75) {
    lines.push('   🎉 Excellent execution rate! Stay consistent.');
  } else if (analytics.behavioralAnalysis.overallSuccessRate < 50) {
    lines.push('   💭 Review your approach to tasks. What patterns lead to failures?');
  }
  lines.push('');

  // Time optimization
  if (analytics.behavioralAnalysis.bestPerformingTimeBlock) {
    const best = analytics.behavioralAnalysis.bestPerformingTimeBlock;
    lines.push(`⏰ Peak Performance: ${best.label} (${best.successRate}% success)`);
    lines.push(`   💡 Reserve your most important work for ${best.label.toLowerCase()}.`);
  }
  lines.push('');

  // Energy management
  if (
    analytics.behavioralAnalysis.energyOutcomeCorrelation &&
    analytics.behavioralAnalysis.energyOutcomeCorrelation > 0.5
  ) {
    lines.push('⚡ Energy Insight: Your energy strongly impacts success.');
    lines.push('   → Invest in sleep, exercise, and nutrition as performance leverage.');
  }
  lines.push('');

  // Top priorities
  if (analytics.synthesizedRecommendations.length > 0) {
    lines.push('🎯 Top Priorities:');
    analytics.synthesizedRecommendations.slice(0, 3).forEach((rec, i) => {
      lines.push(`   ${i + 1}. ${rec.title}`);
      lines.push(`      ${rec.description}`);
    });
  }
  lines.push('');

  // Risks to address
  if (analytics.riskAlerts.length > 0) {
    lines.push('⚠️  Risks to Address:');
    analytics.riskAlerts.slice(0, 2).forEach((alert) => {
      lines.push(`   • ${alert.message}`);
      lines.push(`     → ${alert.recommendation}`);
    });
  }

  return lines.join('\n');
}

/**
 * Example 6: Batch analysis for all active users
 * 
 * Run analytics across all users and identify system-wide patterns
 */
export async function runBatchAnalysis(): Promise<void> {
  const users = await prisma.user.findMany();

  console.log(`🚀 Running batch analysis for ${users.length} users...`);

  for (const user of users) {
    try {
      await storeAnalyticsSnapshot(user.id);
    } catch (error) {
      console.error(`❌ Error analyzing user ${user.id}:`, error);
    }
  }

  console.log('✅ Batch analysis complete');
}

/**
 * Example 7: Export analytics for reporting
 */
export async function exportAnalyticsReport(userId: string): Promise<object> {
  const analytics = await generateUserInsights(userId);

  return {
    userId,
    timestamp: analytics.timestamp,
    summary: {
      healthScore: analytics.overallHealthScore,
      decisionQualityScore: analytics.decisionQualityScore,
      successRate: analytics.behavioralAnalysis.overallSuccessRate,
    },
    decisions: {
      total: analytics.decisionAnalysis.totalDecisions,
      avgRiskScore: analytics.decisionAnalysis.avgRiskScore,
      trend: analytics.decisionAnalysis.riskTrend,
      momentum: analytics.decisionAnalysis.decisionMomentum,
    },
    behavior: {
      successRate: analytics.behavioralAnalysis.overallSuccessRate,
      consistency: analytics.behavioralAnalysis.consistencyScore,
      bestTimeBlock: analytics.behavioralAnalysis.bestPerformingTimeBlock?.label,
    },
    recommendations: analytics.synthesizedRecommendations.map((r) => ({
      priority: r.priority,
      title: r.title,
      actionItems: r.actionItems,
    })),
    alerts: analytics.riskAlerts.map((a) => ({
      severity: a.severity,
      message: a.message,
      recommendation: a.recommendation,
    })),
  };
}
