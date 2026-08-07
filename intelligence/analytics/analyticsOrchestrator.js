"use strict";
/**
 * Main Analytics Orchestrator
 *
 * Coordinates all analytics engines and provides a unified interface
 * for comprehensive intelligence generation. Orchestrates:
 * - Data aggregation and normalization
 * - Decision pattern analysis
 * - Behavioral pattern analysis
 * - Insight synthesis and prioritization
 * - Actionable recommendation generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runComprehensiveAnalytics = runComprehensiveAnalytics;
exports.generateExecutiveSummary = generateExecutiveSummary;
const decisionAnalyzer_1 = require("./decisionAnalyzer");
const behavioralAnalyzer_1 = require("./behavioralAnalyzer");
/**
 * Main analytics pipeline: orchestrates all analysis engines
 * @param input Raw data from database
 * @returns Comprehensive analytics results
 */
function runComprehensiveAnalytics(input) {
    // Normalize inputs
    const decisions = (0, decisionAnalyzer_1.normalizeDecisions)(input.decisions || []);
    const events = (0, behavioralAnalyzer_1.normalizeBehavioralEvents)(input.behavioralEvents || []);
    // Run analyses
    const decisionAnalysis = (0, decisionAnalyzer_1.analyzeDecisionPatterns)(decisions);
    const decisionQualityScore = (0, decisionAnalyzer_1.computeDecisionQualityScore)(decisionAnalysis);
    const riskAlerts = (0, decisionAnalyzer_1.detectRiskAlerts)(decisionAnalysis, decisions);
    const behavioralAnalysis = (0, behavioralAnalyzer_1.analyzeBehavior)(events);
    const behavioralInsights = (0, behavioralAnalyzer_1.generateBehavioralInsights)(behavioralAnalysis);
    // Synthesize recommendations
    const synthesizedRecommendations = synthesizeRecommendations(decisionAnalysis, riskAlerts, behavioralAnalysis, behavioralInsights);
    // Compute overall health score
    const overallHealthScore = computeHealthScore(decisionQualityScore, behavioralAnalysis, riskAlerts);
    return {
        timestamp: new Date(),
        userId: input.userId,
        decisionAnalysis,
        decisionQualityScore,
        riskAlerts,
        behavioralAnalysis,
        behavioralInsights,
        synthesizedRecommendations,
        overallHealthScore,
    };
}
/**
 * Synthesize recommendations from all analysis sources
 * @param decisionAnalysis Decision patterns
 * @param riskAlerts Risk alerts
 * @param behavioralAnalysis Behavioral patterns
 * @param behavioralInsights Behavioral insights
 * @returns Prioritized recommendations
 */
function synthesizeRecommendations(decisionAnalysis, riskAlerts, behavioralAnalysis, behavioralInsights) {
    const recommendations = [];
    // Decision-related recommendations
    if (decisionAnalysis.riskTrend > 15) {
        recommendations.push({
            priority: 'high',
            category: 'decision',
            title: 'Address Rising Decision Risk',
            description: 'Your decision risk is trending upward. This suggests increasing complexity, pressure, or reduced decision-making quality.',
            actionItems: [
                'Review recent decisions for common patterns and root causes',
                'Consult with trusted advisors or mentors on key decisions',
                'Take time for reflection before making major commitments',
                'Consider whether external factors (stress, fatigue) are affecting judgment',
            ],
            estimatedImpact: 'Could reduce future risk-related losses by 20-30%',
            timeframe: 'Implement this week',
        });
    }
    if (decisionAnalysis.decisionMomentum === 'improving') {
        recommendations.push({
            priority: 'low',
            category: 'decision',
            title: 'Maintain Decision Momentum',
            description: 'Your recent decisions are showing improvement. Continue current practices.',
            actionItems: [
                'Document decision-making processes that are working',
                'Share successful approaches with colleagues or team',
                'Continue regular reflection on outcomes',
            ],
            estimatedImpact: 'Reinforces positive decision-making habits',
            timeframe: 'Ongoing',
        });
    }
    // Behavioral timing recommendations
    if (behavioralAnalysis.bestPerformingTimeBlock) {
        recommendations.push({
            priority: 'high',
            category: 'timing',
            title: `Optimize for ${behavioralAnalysis.bestPerformingTimeBlock.label} Performance`,
            description: `You perform best during ${behavioralAnalysis.bestPerformingTimeBlock.label.toLowerCase()} (${behavioralAnalysis.bestPerformingTimeBlock.successRate}% success rate).`,
            actionItems: [
                `Schedule challenging tasks during ${behavioralAnalysis.bestPerformingTimeBlock.label.toLowerCase()}`,
                `Protect this time from meetings and interruptions`,
                `Use other times for lighter, administrative work`,
                `Monitor if this pattern remains consistent over weeks`,
            ],
            estimatedImpact: 'Could improve productivity by 15-25%',
            timeframe: 'Implement next week',
        });
    }
    // Wellness recommendations
    if (behavioralAnalysis.energyOutcomeCorrelation &&
        behavioralAnalysis.energyOutcomeCorrelation > 0.5) {
        recommendations.push({
            priority: 'high',
            category: 'wellness',
            title: 'Prioritize Energy Management',
            description: 'Your energy levels strongly correlate with success. Energy is a key leverage point.',
            actionItems: [
                'Establish consistent sleep schedule',
                'Include regular physical activity (30+ min daily)',
                'Optimize nutrition and hydration throughout day',
                'Schedule regular breaks and recovery time',
                'Track energy levels to identify patterns',
            ],
            estimatedImpact: 'Could improve overall success rate by 20-35%',
            timeframe: 'Start immediately, measure over 2-4 weeks',
        });
    }
    // Risk mitigation recommendations
    if (riskAlerts.length > 0) {
        const criticalAlerts = riskAlerts.filter((a) => a.severity === 'critical' || a.severity === 'high');
        if (criticalAlerts.length > 0) {
            recommendations.push({
                priority: 'critical',
                category: 'decision',
                title: 'Address Critical Risk Alerts',
                description: `${criticalAlerts.length} high-severity risk alerts detected.`,
                actionItems: criticalAlerts.slice(0, 3).map((alert) => `• ${alert.recommendation}`),
                estimatedImpact: 'Critical to prevent major decision failures',
                timeframe: 'Address immediately',
            });
        }
    }
    // Consistency improvement recommendations
    if (behavioralAnalysis.consistencyScore < 50) {
        recommendations.push({
            priority: 'medium',
            category: 'behavioral',
            title: 'Improve Task Performance Consistency',
            description: 'Your success rate varies significantly across different task types.',
            actionItems: [
                'Identify what makes your most successful tasks different',
                'Document processes for high-success tasks',
                'Apply successful patterns to lower-performing task types',
                'Consider specialized training for weaker task categories',
            ],
            estimatedImpact: 'Could reduce performance variance by 30-40%',
            timeframe: 'Analyze this week, implement over next 2-4 weeks',
        });
    }
    // Sort by priority
    const priorityRank = { critical: 4, high: 3, medium: 2, low: 1 };
    recommendations.sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]);
    return recommendations.slice(0, 6); // Return top 6 recommendations
}
/**
 * Compute overall health score (0-100)
 * @param decisionQualityScore Decision quality
 * @param behavioralAnalysis Behavioral patterns
 * @param riskAlerts Risk alerts
 * @returns Overall health score
 */
function computeHealthScore(decisionQualityScore, behavioralAnalysis, riskAlerts) {
    // Base score components
    const decisionComponent = decisionQualityScore * 0.4; // 40% weight
    const behavioralComponent = behavioralAnalysis.overallSuccessRate * 0.35; // 35% weight
    const consistencyComponent = behavioralAnalysis.consistencyScore * 0.15; // 15% weight
    let baseScore = decisionComponent + behavioralComponent + consistencyComponent;
    // Risk alert penalty
    const criticalAlerts = riskAlerts.filter((a) => a.severity === 'critical').length;
    const highAlerts = riskAlerts.filter((a) => a.severity === 'high').length;
    const mediumAlerts = riskAlerts.filter((a) => a.severity === 'medium').length;
    const riskPenalty = criticalAlerts * 5 + highAlerts * 2 + mediumAlerts * 0.5;
    baseScore = Math.max(0, baseScore - riskPenalty);
    // Wellness bonus for good energy correlation
    if (behavioralAnalysis.energyOutcomeCorrelation && behavioralAnalysis.energyOutcomeCorrelation > 0.6) {
        baseScore = Math.min(100, baseScore + 5);
    }
    return Number(baseScore.toFixed(1));
}
/**
 * Extract executive summary from comprehensive analytics
 * @param analytics Comprehensive analytics results
 * @returns Executive summary string
 */
function generateExecutiveSummary(analytics) {
    const lines = [];
    lines.push(`📊 Overall Health Score: ${analytics.overallHealthScore}/100`);
    lines.push(`🎯 Decision Quality: ${analytics.decisionQualityScore}/100`);
    lines.push(`📈 Success Rate: ${analytics.behavioralAnalysis.overallSuccessRate}%`);
    if (analytics.riskAlerts.length > 0) {
        const criticalCount = analytics.riskAlerts.filter((a) => a.severity === 'critical').length;
        if (criticalCount > 0) {
            lines.push(`⚠️  CRITICAL: ${criticalCount} high-severity risk alert(s)`);
        }
    }
    if (analytics.behavioralAnalysis.bestPerformingTimeBlock) {
        lines.push(`✅ Peak Performance: ${analytics.behavioralAnalysis.bestPerformingTimeBlock.label} ` +
            `(${analytics.behavioralAnalysis.bestPerformingTimeBlock.successRate}% success)`);
    }
    if (analytics.synthesizedRecommendations.length > 0) {
        const topRec = analytics.synthesizedRecommendations[0];
        lines.push(`💡 Top Priority: ${topRec.title}`);
    }
    return lines.join('\n');
}
