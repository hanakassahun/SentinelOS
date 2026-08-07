"use strict";
/**
 * Decision Analysis Engine
 *
 * Analyzes user decision patterns, risk trends, and decision-making quality
 * over time. Provides insights into:
 * - Risk score trends
 * - Decision outcome distributions
 * - High-risk decision periods
 * - Decision confidence and consistency
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDecisions = normalizeDecisions;
exports.analyzeDecisionPatterns = analyzeDecisionPatterns;
exports.detectRiskAlerts = detectRiskAlerts;
exports.computeDecisionQualityScore = computeDecisionQualityScore;
/**
 * Parse Prisma decision records and normalize to snapshots
 * @param decisions Raw decision records
 * @returns Normalized decision snapshots
 */
function normalizeDecisions(decisions) {
    return decisions.map((d) => ({
        id: d.id,
        riskScore: Number(d.riskScore) || 0,
        riskLevel: d.riskLevel,
        description: d.description || '',
        tags: d.tags ? (typeof d.tags === 'string' ? d.tags.split(',').map((t) => t.trim()) : []) : [],
        createdAt: new Date(d.createdAt),
    }));
}
/**
 * Compute comprehensive decision metrics
 * @param decisions Decision snapshots
 * @returns Analysis results
 */
function analyzeDecisionPatterns(decisions) {
    if (decisions.length === 0) {
        return {
            totalDecisions: 0,
            avgRiskScore: 0,
            medianRiskScore: 0,
            riskDistribution: { low: 0, medium: 0, high: 0 },
            riskTrend: 0,
            tagRiskMap: new Map(),
        };
    }
    // Sort by date for time-based analysis
    const sorted = [...decisions].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    // Basic statistics
    const riskScores = sorted.map((d) => d.riskScore);
    const avgRiskScore = Number((riskScores.reduce((a, b) => a + b, 0) / riskScores.length).toFixed(2));
    const sortedScores = [...riskScores].sort((a, b) => a - b);
    const medianRiskScore = riskScores.length % 2 === 0
        ? (sortedScores[riskScores.length / 2 - 1] + sortedScores[riskScores.length / 2]) / 2
        : sortedScores[Math.floor(riskScores.length / 2)];
    // Risk distribution
    const riskDistribution = {
        low: sorted.filter((d) => d.riskLevel === 'low').length,
        medium: sorted.filter((d) => d.riskLevel === 'medium').length,
        high: sorted.filter((d) => d.riskLevel === 'high').length,
    };
    // Trend calculation: recent 7 decisions vs previous 7
    const mid = Math.floor(sorted.length / 2);
    const recentDecisions = sorted.slice(Math.max(0, sorted.length - 7));
    const previousDecisions = sorted.slice(Math.max(0, mid - 7), mid);
    const recentAvg = recentDecisions.length > 0 ? recentDecisions.reduce((a, d) => a + d.riskScore, 0) / recentDecisions.length : 0;
    const prevAvg = previousDecisions.length > 0 ? previousDecisions.reduce((a, d) => a + d.riskScore, 0) / previousDecisions.length : 0;
    const riskTrend = prevAvg === 0 ? 0 : Number((((recentAvg - prevAvg) / prevAvg) * 100).toFixed(1));
    // Identify highest risk period (3-day rolling window)
    let highestRiskPeriod;
    if (sorted.length > 3) {
        let maxAvg = 0;
        let maxWindow = 0;
        for (let i = 0; i <= sorted.length - 3; i++) {
            const window = sorted.slice(i, i + 3);
            const windowAvg = window.reduce((a, d) => a + d.riskScore, 0) / window.length;
            if (windowAvg > maxAvg) {
                maxAvg = windowAvg;
                maxWindow = i;
            }
        }
        const window = sorted.slice(maxWindow, maxWindow + 3);
        highestRiskPeriod = {
            startDate: window[0].createdAt,
            endDate: window[window.length - 1].createdAt,
            avgRiskScore: Number(maxAvg.toFixed(2)),
            decisionCount: window.length,
        };
    }
    // Risk days streak
    let riskDaysStreak = 0;
    for (let i = sorted.length - 1; i >= 0; i--) {
        const dayStart = new Date(sorted[i].createdAt);
        dayStart.setHours(0, 0, 0, 0);
        const dayDecisions = sorted.filter((d) => {
            const dDay = new Date(d.createdAt);
            dDay.setHours(0, 0, 0, 0);
            return dDay.getTime() === dayStart.getTime();
        });
        if (dayDecisions.some((d) => d.riskLevel === 'high')) {
            riskDaysStreak++;
        }
        else {
            break;
        }
    }
    // Decision momentum
    let decisionMomentum = 'stable';
    if (riskTrend < -10) {
        decisionMomentum = 'improving';
    }
    else if (riskTrend > 10) {
        decisionMomentum = 'declining';
    }
    // Tag risk analysis
    const tagRiskMap = new Map();
    for (const decision of sorted) {
        for (const tag of decision.tags) {
            if (!tagRiskMap.has(tag)) {
                tagRiskMap.set(tag, { avgRisk: 0, count: 0 });
            }
            const tagData = tagRiskMap.get(tag);
            tagData.avgRisk = (tagData.avgRisk * tagData.count + decision.riskScore) / (tagData.count + 1);
            tagData.count++;
            tagData.avgRisk = Number(tagData.avgRisk.toFixed(2));
        }
    }
    return {
        totalDecisions: sorted.length,
        avgRiskScore,
        medianRiskScore: Number(medianRiskScore.toFixed(2)),
        riskDistribution,
        riskTrend,
        highestRiskPeriod,
        riskDaysStreak: riskDaysStreak > 0 ? riskDaysStreak : undefined,
        decisionMomentum,
        tagRiskMap,
    };
}
/**
 * Detect risk patterns and generate alerts
 * @param analysis Decision analysis
 * @param decisions Raw decisions for context
 * @returns Array of risk alerts
 */
function detectRiskAlerts(analysis, decisions) {
    const alerts = [];
    // Alert 1: High average risk score
    if (analysis.avgRiskScore > 65) {
        alerts.push({
            severity: analysis.avgRiskScore > 75 ? 'critical' : 'high',
            message: 'Average decision risk is elevated.',
            reason: `Average risk score is ${analysis.avgRiskScore}, indicating consistently risky decisions.`,
            recommendation: 'Review recent decisions and identify common risk factors. Consider more deliberate planning before major decisions.',
            confidence: 0.9,
            affectedDecisions: decisions.filter((d) => d.riskScore > 60).map((d) => d.id),
        });
    }
    // Alert 2: Risk trend declining
    if (analysis.riskTrend > 20) {
        alerts.push({
            severity: 'high',
            message: 'Risk trend is sharply increasing.',
            reason: `Risk scores have increased ${analysis.riskTrend}% recently.`,
            recommendation: 'Recent decisions are riskier than historical patterns. Take time to assess root causes.',
            confidence: 0.85,
            affectedDecisions: decisions.slice(-7).map((d) => d.id),
        });
    }
    // Alert 3: Risk days streak
    if (analysis.riskDaysStreak && analysis.riskDaysStreak >= 3) {
        alerts.push({
            severity: 'high',
            message: `${analysis.riskDaysStreak} consecutive days with high-risk decisions.`,
            reason: `High-risk decisions detected on ${analysis.riskDaysStreak} consecutive days.`,
            recommendation: 'This streak suggests mounting pressure or fatigue. Consider taking a break before making further major decisions.',
            confidence: 0.95,
            affectedDecisions: decisions
                .filter((d) => d.riskLevel === 'high' && new Date().getTime() - d.createdAt.getTime() < 3 * 24 * 60 * 60 * 1000)
                .map((d) => d.id),
        });
    }
    // Alert 4: Heavily skewed toward high risk
    const highRiskPercent = (analysis.riskDistribution.high / analysis.totalDecisions) * 100;
    if (highRiskPercent > 50) {
        alerts.push({
            severity: 'medium',
            message: `${highRiskPercent.toFixed(0)}% of decisions are high-risk.`,
            reason: 'More than half of recent decisions fall into the high-risk category.',
            recommendation: 'Evaluate whether risk appetite has increased or if decisions are becoming harder. Seek diverse perspectives.',
            confidence: 0.8,
            affectedDecisions: decisions.filter((d) => d.riskLevel === 'high').map((d) => d.id),
        });
    }
    // Alert 5: High-risk tag pattern
    for (const [tag, data] of analysis.tagRiskMap) {
        if (data.avgRisk > 70 && data.count >= 3) {
            alerts.push({
                severity: 'medium',
                message: `Tag "${tag}" is associated with high risk (avg: ${data.avgRisk}).`,
                reason: `Decisions tagged "${tag}" average ${data.avgRisk} risk across ${data.count} decisions.`,
                recommendation: `Be cautious with decisions tagged "${tag}". Consider additional due diligence or expert consultation.`,
                confidence: 0.75,
                affectedDecisions: decisions.filter((d) => d.tags.includes(tag)).map((d) => d.id),
            });
        }
    }
    // Sort by severity
    const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };
    alerts.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
    return alerts.slice(0, 5); // Limit to 5 most critical alerts
}
/**
 * Compute a decision quality score (0-100)
 * @param analysis Decision analysis
 * @returns Quality score
 */
function computeDecisionQualityScore(analysis) {
    let score = 100;
    // Deduct for high average risk
    score -= Math.min(50, (analysis.avgRiskScore / 100) * 50);
    // Deduct for negative trend
    if (analysis.riskTrend > 0) {
        score -= Math.min(15, (analysis.riskTrend / 100) * 15);
    }
    // Deduct for risk streak
    if (analysis.riskDaysStreak && analysis.riskDaysStreak >= 3) {
        score -= 10 * Math.min(3, analysis.riskDaysStreak);
    }
    return Math.max(0, Number(score.toFixed(1)));
}
