"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistoricalTaskTrends = getHistoricalTaskTrends;
exports.calculateTimeBlockSuccess = calculateTimeBlockSuccess;
const prismaClient_1 = require("../server/services/prismaClient");
const prisma = prismaClient_1.default;
function normalizeOutcome(outcome) {
    const normalized = (outcome ?? '').toLowerCase();
    return ['completed', 'complete', 'success', 'succeeded', 'done'].includes(normalized);
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
