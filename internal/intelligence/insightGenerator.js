"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInsightsFromLogs = generateInsightsFromLogs;
const analysis_1 = require("../../internal/pattern-engine/analysis");
const energyAnalyzer_1 = require("../../intelligence/energyAnalyzer");
function weekStartFor(date) {
    const d = new Date(date);
    // align to week starting on Sunday
    const day = d.getDay();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d;
}
function generateInsightsFromLogs(logs) {
    const points = logs
        .map((l) => {
        const ts = l.timestamp || l.time || l.createdAt || l.ts;
        const date = ts ? new Date(ts) : new Date();
        return { value: Number(l.value), date };
    })
        .filter((p) => !Number.isNaN(p.value));
    const values = points.map((p) => p.value);
    const insights = [];
    const avg = (0, analysis_1.calculateAverage)(values);
    if (avg !== null) {
        insights.push({ type: 'AVERAGE', message: `Average value: ${avg.toFixed(2)}`, value: avg });
    }
    const trend = (0, analysis_1.detectTrend)(values);
    insights.push({ type: 'TREND', message: `Trend detected: ${trend}`, trend });
    // Build weekly buckets (by calendar week starting Sunday)
    const weeks = {};
    points.forEach((p) => {
        const start = weekStartFor(p.date);
        const key = start.toISOString().slice(0, 10);
        if (!weeks[key])
            weeks[key] = { start, values: [] };
        weeks[key].values.push(p.value);
    });
    // Sort week keys descending (recent first)
    const weekKeys = Object.keys(weeks).sort((a, b) => (a < b ? 1 : -1));
    const weeklyRecommendations = weekKeys.map((k) => {
        const w = weeks[k];
        const wAvg = (0, analysis_1.calculateAverage)(w.values) ?? 0;
        const wTrend = (0, analysis_1.detectTrend)(w.values);
        // Recommendation heuristics
        let recommendation = 'Keep your current routine.';
        if (w.values.length < 3) {
            recommendation = 'Not enough data this week to give a strong recommendation.';
        }
        else if (avg !== null && wAvg < (avg - 1.0)) {
            recommendation = 'This week your energy was below your recent average — prioritize rest and lighter tasks.';
        }
        else if (avg !== null && wAvg > (avg + 1.0)) {
            recommendation = 'Your energy was above average — schedule demanding tasks while you have momentum.';
        }
        else if (wTrend === 'downward') {
            recommendation = 'Energy trending down this week — reduce workload and schedule recovery time.';
        }
        else if (wTrend === 'upward') {
            recommendation = 'Energy trending up — plan important work and maintain healthy habits.';
        }
        return {
            weekStart: w.start.toISOString(),
            count: w.values.length,
            average: Number(wAvg.toFixed(2)),
            trend: wTrend,
            recommendation,
        };
    });
    // Ensure at least one recommendation per recent week (even if empty buckets)
    // (Already produced above for any week with data.)
    const report = { insights, analysis: { count: values.length, average: avg, trend }, weeklyRecommendations };
    // If these look like energy-style numeric logs (1-10), produce explainable guidance
    const looksLikeEnergy = values.length > 0 && values.every((v) => typeof v === 'number' && v >= 0 && v <= 10);
    if (looksLikeEnergy) {
        try {
            const energyLogs = logs.map((l) => ({ value: Number(l.value), timestamp: l.timestamp || l.time || l.createdAt || l.ts }));
            const ea = (0, energyAnalyzer_1.analyzeEnergy)(energyLogs);
            const guidance = [];
            if (ea.peakPeriod) {
                const pct = ea.weeklyAverage ? Math.round(((ea.peakPeriod.avg - (ea.weeklyAverage || 0)) / (ea.weeklyAverage || 1)) * 100) : 0;
                const whenPhraseMap = {
                    Night: 'at night',
                    Morning: 'before noon',
                    Afternoon: 'in the afternoon',
                    Evening: 'in the evening',
                    Late: 'late at night',
                };
                const when = whenPhraseMap[ea.peakPeriod.label] || `during ${ea.peakPeriod.label}`;
                const msg = `Your highest average energy is ${ea.peakPeriod.avg} (${ea.peakPeriod.count} reports) ${when}.`;
                const rec = pct > 10 ? `You are about ${Math.abs(pct)}% ${ea.peakPeriod.avg > (ea.weeklyAverage || 0) ? 'more' : 'less'} energetic ${when} compared to your weekly average — schedule demanding tasks ${when}.` : `Consider scheduling demanding tasks ${when} when possible.`;
                guidance.push({ message: msg, recommendation: rec });
            }
            if (ea.suddenDrop) {
                guidance.push({
                    message: `Today's average energy is down ${ea.suddenDrop.percent}% compared to your weekly average.`,
                    recommendation: 'Take it easier today: postpone high-effort tasks and prioritize rest or short focused sessions.',
                });
            }
            if (ea.trendPercent !== undefined && Math.abs(ea.trendPercent) >= 10) {
                const dir = ea.trendPercent > 0 ? 'increasing' : 'decreasing';
                guidance.push({
                    message: `Your recent energy is ${dir} (${Math.abs(ea.trendPercent)}% change).`,
                    recommendation: ea.trendPercent > 0 ? 'Leverage this momentum for important work.' : 'Consider reducing load and scheduling recovery time.',
                });
            }
            if (guidance.length)
                report.explainableGuidance = guidance;
        }
        catch (e) {
            // non-fatal: don't break insight generation
        }
    }
    // Generic numeric-behavior guidance for other numeric logs
    const looksLikeNumeric = values.length > 0 && values.every((v) => typeof v === 'number' && !Number.isNaN(v));
    if (!looksLikeEnergy && looksLikeNumeric) {
        try {
            // time-of-day buckets
            const buckets = [
                { label: 'Night', start: 0, end: 6, count: 0, values: [] },
                { label: 'Morning', start: 6, end: 12, count: 0, values: [] },
                { label: 'Afternoon', start: 12, end: 17, count: 0, values: [] },
                { label: 'Evening', start: 17, end: 21, count: 0, values: [] },
                { label: 'Late', start: 21, end: 24, count: 0, values: [] },
            ];
            points.forEach((p) => {
                const h = p.date.getHours();
                const b = buckets.find((bk) => h >= bk.start && h < bk.end) || buckets[0];
                b.count += 1;
                b.values.push(p.value);
            });
            const total = values.length;
            const top = buckets.slice().sort((a, b) => b.count - a.count)[0];
            const behaviorLabel = (logs[0] && (logs[0].behaviorType || logs[0].type || logs[0].name)) || 'this behavior';
            const guidance = [];
            if (top && top.count / total >= 0.55) {
                const pct = Math.round((top.count / total) * 100);
                guidance.push({
                    message: `You report ${behaviorLabel} ${pct}% of the time ${top.label.toLowerCase()}.`,
                    recommendation: `If possible, schedule or expect ${behaviorLabel} ${top.label.toLowerCase()}.`,
                });
            }
            // Average-based guidance
            if (avg !== null) {
                if (avg >= 8) {
                    guidance.push({ message: `Your average ${behaviorLabel} is high (${avg.toFixed(1)}).`, recommendation: 'Consider whether this reflects a sustained pattern and adjust planning accordingly.' });
                }
                else if (avg <= 3) {
                    guidance.push({ message: `Your average ${behaviorLabel} is low (${avg.toFixed(1)}).`, recommendation: 'Consider small, consistent actions to raise this metric if desired.' });
                }
            }
            if (trend === 'upward' || trend === 'downward') {
                guidance.push({ message: `Your recent ${behaviorLabel} trend is ${trend}.`, recommendation: trend === 'upward' ? 'Leverage this momentum.' : 'Consider interventions to reverse the decline.' });
            }
            if (guidance.length)
                report.explainableGuidance = (report.explainableGuidance || []).concat(guidance);
        }
        catch (e) {
            // ignore
        }
    }
    return report;
}
exports.default = { generateInsightsFromLogs };
