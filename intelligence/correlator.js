"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightTemplateEngine = void 0;
exports.analyzeDeviations = analyzeDeviations;
exports.getHistoricalTaskTrends = getHistoricalTaskTrends;
exports.calculateTimeBlockSuccess = calculateTimeBlockSuccess;
const prismaClient_1 = require("../server/services/prismaClient");
const prisma = prismaClient_1.default;
class InsightTemplateEngine {
    constructor() {
        this.templates = {
            morning: ({ hourBlock, successRate, rollingAverage }) => `You finish work ${Math.round((successRate / Math.max(rollingAverage, 1)) * 100)}% more often during your morning blocks. Consider moving this task out of your ${this.formatHour(hourBlock)} high-friction window.`,
            afternoon: ({ hourBlock, successRate, rollingAverage }) => `Your afternoon rhythm is showing friction. You are finishing tasks at ${successRate}% success versus a ${Math.round(rollingAverage)}% rolling baseline, so move demanding work away from ${this.formatHour(hourBlock)}.`,
            evening: ({ hourBlock, successRate, rollingAverage }) => `Your evening plan is underperforming. You are succeeding at ${successRate}% versus ${Math.round(rollingAverage)}% historically, so consider rescheduling this task away from ${this.formatHour(hourBlock)}.`,
            night: ({ hourBlock, successRate, rollingAverage }) => `You finish work ${Math.round((successRate / Math.max(rollingAverage, 1)) * 100)}% more often during your morning blocks. Consider moving this task out of your ${this.formatHour(hourBlock)} high-friction window.`,
        };
    }
    render(payload) {
        const period = this.getTimePeriod(payload.hourBlock);
        return this.templates[period](payload);
    }
    getTimePeriod(hourBlock) {
        if (hourBlock >= 5 && hourBlock < 12)
            return 'morning';
        if (hourBlock >= 12 && hourBlock < 18)
            return 'afternoon';
        if (hourBlock >= 18 && hourBlock < 23)
            return 'evening';
        return 'night';
    }
    formatHour(hourBlock) {
        const suffix = hourBlock >= 12 ? 'PM' : 'AM';
        const normalized = hourBlock % 12 === 0 ? 12 : hourBlock % 12;
        return `${normalized} ${suffix}`;
    }
}
exports.InsightTemplateEngine = InsightTemplateEngine;
function normalizeOutcome(outcome) {
    const normalized = (outcome ?? '').toLowerCase();
    return ['completed', 'complete', 'success', 'succeeded', 'done'].includes(normalized);
}
function analyzeDeviations(history) {
    if (history.length === 0) {
        return [];
    }
    const successRates = history.map((entry) => entry.successRate);
    const baselineMean = successRates.reduce((sum, value) => sum + value, 0) / successRates.length;
    const variance = successRates.reduce((sum, value) => sum + (value - baselineMean) ** 2, 0) / successRates.length;
    const standardDeviation = Math.sqrt(variance);
    return history
        .map((entry, index) => {
        const previousEntries = history.slice(Math.max(0, index - 3), index + 1);
        const rollingAverage = previousEntries.reduce((sum, item) => sum + item.successRate, 0) / previousEntries.length;
        const deviationFromBaseline = entry.successRate - baselineMean;
        const isSignificantDrop = entry.successRate < baselineMean - Math.max(10, standardDeviation * 0.75);
        if (!isSignificantDrop) {
            return null;
        }
        return {
            hourBlock: entry.hourBlock,
            successRate: entry.successRate,
            rollingAverage,
            standardDeviation,
            deviationFromBaseline,
            reason: `Success rate fell ${Math.abs(deviationFromBaseline).toFixed(1)} points below the user's baseline.`,
        };
    })
        .filter((item) => item !== null)
        .sort((a, b) => a.hourBlock - b.hourBlock);
}
async function getHistoricalTaskTrends(userId) {
    const taskModel = prisma.taskEvent ?? prisma.eventLog ?? prisma.behavioralEvent;
    const groupedRows = await taskModel.groupBy({
        by: ['plannedTime'],
        where: { userId },
        _count: {
            _all: true,
        },
        _avg: {
            energyLevel: true,
            moodLevel: true,
        },
    });
    const buckets = new Map();
    groupedRows.forEach((row) => {
        const scheduledTime = row.plannedTime ?? row.scheduledTime;
        if (!scheduledTime) {
            return;
        }
        const hourBlock = new Date(scheduledTime).getHours();
        const current = buckets.get(hourBlock) ?? { totalTasks: 0, moodTotal: 0, energyTotal: 0, performanceTotal: 0, count: 0 };
        const moodValue = row._avg?.moodLevel ?? null;
        const energyValue = row._avg?.energyLevel ?? null;
        const performanceValue = typeof moodValue === 'number' && typeof energyValue === 'number'
            ? (moodValue + energyValue) / 2
            : moodValue ?? energyValue;
        current.totalTasks += Number(row._count?._all ?? 0);
        current.count += 1;
        if (typeof moodValue === 'number') {
            current.moodTotal += moodValue;
        }
        if (typeof energyValue === 'number') {
            current.energyTotal += energyValue;
        }
        if (typeof performanceValue === 'number') {
            current.performanceTotal += performanceValue;
        }
        buckets.set(hourBlock, current);
    });
    return Array.from(buckets.entries())
        .map(([hourBlock, bucket]) => ({
        hourBlock,
        totalTasks: bucket.totalTasks,
        averageMood: bucket.count > 0 && bucket.moodTotal > 0 ? bucket.moodTotal / bucket.count : null,
        averageEnergy: bucket.count > 0 && bucket.energyTotal > 0 ? bucket.energyTotal / bucket.count : null,
        averagePerformance: bucket.count > 0 && bucket.performanceTotal > 0 ? bucket.performanceTotal / bucket.count : null,
    }))
        .sort((a, b) => a.hourBlock - b.hourBlock);
}
async function calculateTimeBlockSuccess(userId) {
    const tasks = await prisma.behavioralEvent.findMany({
        where: { userId },
        select: {
            plannedTime: true,
            executedTime: true,
            outcome: true,
        },
    });
    const blocks = {};
    for (let i = 0; i < 24; i += 1) {
        blocks[i] = { completed: 0, total: 0 };
    }
    tasks.forEach((task) => {
        const referenceTime = task.executedTime ?? task.plannedTime;
        if (!referenceTime) {
            return;
        }
        const hour = new Date(referenceTime).getHours();
        blocks[hour].total += 1;
        if (normalizeOutcome(task.outcome)) {
            blocks[hour].completed += 1;
        }
    });
    return Object.keys(blocks).map((key) => {
        const hourBlock = parseInt(key, 10);
        const { completed, total } = blocks[hourBlock];
        const successRate = total > 0 ? (completed / total) * 100 : 100;
        return {
            hourBlock,
            successRate: Math.round(successRate),
            totalTasks: total,
            riskFlag: total >= 3 && successRate < 60,
        };
    });
}
