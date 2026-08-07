"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAverage = calculateAverage;
exports.detectTrend = detectTrend;
exports.correlate = correlate;
function calculateAverage(data) {
    if (!data || data.length === 0)
        return null;
    const sum = data.reduce((s, v) => s + v, 0);
    return sum / data.length;
}
function detectTrend(data) {
    if (!data || data.length < 2)
        return 'stable';
    const n = data.length;
    const half = Math.floor(n / 2);
    const first = data.slice(0, half);
    const second = data.slice(half);
    const avgFirst = calculateAverage(first) ?? 0;
    const avgSecond = calculateAverage(second) ?? 0;
    const diff = avgSecond - avgFirst;
    const rel = Math.abs(diff) / (Math.max(Math.abs(avgFirst), Math.abs(avgSecond), 1));
    if (rel < 0.05)
        return 'stable';
    return diff > 0 ? 'upward' : 'downward';
}
function correlate(x, y) {
    if (!x || !y || x.length !== y.length || x.length === 0)
        return null;
    const n = x.length;
    const avgX = calculateAverage(x);
    const avgY = calculateAverage(y);
    let num = 0;
    let denX = 0;
    let denY = 0;
    for (let i = 0; i < n; i++) {
        const dx = x[i] - avgX;
        const dy = y[i] - avgY;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
    }
    const denom = Math.sqrt(denX * denY);
    if (denom === 0)
        return 0;
    return num / denom;
}
exports.default = { calculateAverage, detectTrend, correlate };
