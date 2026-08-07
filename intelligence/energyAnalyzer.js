"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeEnergy = analyzeEnergy;
function avg(values) {
    if (!values.length)
        return undefined;
    return values.reduce((a, b) => a + b, 0) / values.length;
}
function analyzeEnergy(logs, now = new Date()) {
    const totalLogs = logs.length;
    if (!totalLogs)
        return { totalLogs, peakPeriod: null, suddenDrop: null };
    const msPerDay = 24 * 60 * 60 * 1000;
    const startWeek = new Date(now.getTime() - 7 * msPerDay);
    const weekLogs = logs.filter((l) => new Date(l.timestamp) >= startWeek);
    const weeklyAverage = avg(weekLogs.map((l) => l.value));
    // Recent vs previous: use 3-day windows
    const recentWindow = 3;
    const recentStart = new Date(now.getTime() - recentWindow * msPerDay);
    const prevStart = new Date(now.getTime() - 2 * recentWindow * msPerDay);
    const recentLogs = logs.filter((l) => new Date(l.timestamp) >= recentStart);
    const prevLogs = logs.filter((l) => new Date(l.timestamp) >= prevStart && new Date(l.timestamp) < recentStart);
    const recentAverage = avg(recentLogs.map((l) => l.value));
    const previousAverage = avg(prevLogs.map((l) => l.value));
    let trendPercent = undefined;
    if (recentAverage !== undefined && previousAverage !== undefined && previousAverage !== 0) {
        trendPercent = ((recentAverage - previousAverage) / previousAverage) * 100;
    }
    // Time of day pattern: bucket by blocks
    const buckets = [
        { label: 'Night', start: 0, end: 6, values: [] },
        { label: 'Morning', start: 6, end: 12, values: [] },
        { label: 'Afternoon', start: 12, end: 17, values: [] },
        { label: 'Evening', start: 17, end: 21, values: [] },
        { label: 'Late', start: 21, end: 24, values: [] },
    ];
    for (const l of logs) {
        const h = new Date(l.timestamp).getHours();
        const b = buckets.find((bk) => h >= bk.start && h < bk.end) || buckets[0];
        b.values.push(l.value);
    }
    let peakPeriod = null;
    const bucketAverages = buckets.map((b) => ({ label: b.label, avg: avg(b.values), count: b.values.length }));
    const nonEmpty = bucketAverages.filter((b) => b.avg !== undefined);
    if (nonEmpty.length) {
        nonEmpty.sort((a, b) => b.avg - a.avg);
        const top = nonEmpty[0];
        peakPeriod = { label: top.label, avg: Number(top.avg.toFixed(2)), count: top.count };
    }
    // Today's average and sudden drop detection
    const startToday = new Date(now.toDateString());
    const todays = logs.filter((l) => new Date(l.timestamp) >= startToday).map((l) => l.value);
    const todaysAverage = todays.length ? avg(todays) : null;
    let suddenDrop = null;
    if (todaysAverage !== null &&
        todaysAverage !== undefined &&
        weeklyAverage !== undefined) {
        const diff = Number((weeklyAverage - Number(todaysAverage)).toFixed(2));
        const percent = (diff / weeklyAverage) * 100;
        if (percent >= 25 && diff >= 1.5) {
            suddenDrop = { percent: Number(percent.toFixed(1)), diff };
        }
    }
    return {
        totalLogs,
        weeklyAverage: weeklyAverage === undefined ? undefined : Number(weeklyAverage.toFixed(2)),
        recentAverage: recentAverage === undefined ? undefined : Number(recentAverage.toFixed(2)),
        previousAverage: previousAverage === undefined ? undefined : Number(previousAverage.toFixed(2)),
        trendPercent: trendPercent === undefined ? undefined : Number(trendPercent.toFixed(1)),
        peakPeriod,
        todaysAverage: todaysAverage === null ? null : Number(todaysAverage.toFixed(2)),
        suddenDrop,
    };
}
