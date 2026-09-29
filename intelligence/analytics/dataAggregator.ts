/*
 * Data Aggregation Module
 *
 * Responsible for collecting, normalizing, and preparing raw behavioral data
 * for downstream analytics processing. This module handles:
 * - Log aggregation by time windows
 * - Event filtering and normalization
 * - Statistical computation utilities
 * - Data quality validation
 */

import { BehavioralEvent } from '../types';

export interface TimeWindow {
  label: string;
  start: Date;
  end: Date;
}

export interface AggregatedMetrics {
  count: number;
  sum: number;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  q25: number;
  q75: number;
}

export function generateTimeWindows(now: Date, windowSize: number): TimeWindow[] {
  const msPerDay = 24 * 60 * 60 * 1000;
  const windows: TimeWindow[] = [];

  for (let i = 0; i < windowSize; i++) {
    const endTime = new Date(now.getTime() - i * msPerDay);
    endTime.setHours(23, 59, 59, 999);

    const startTime = new Date(now.getTime() - (i + 1) * msPerDay);
    startTime.setHours(0, 0, 0, 0);

    windows.push({
      label: `Day ${i}`,
      start: startTime,
      end: endTime,
    });
  }

  return windows;
}

export function filterByDateRange<T extends { timestamp?: string; createdAt?: string; executedTime?: string; plannedTime?: string }>(
  items: T[],
  start: Date,
  end: Date,
): T[] {
  return items.filter((item) => {
    const timestamp = new Date(
      item.timestamp || item.executedTime || item.plannedTime || item.createdAt || '',
    );
    return timestamp >= start && timestamp <= end;
  });
}

export function computeMetrics(values: number[]): AggregatedMetrics | null {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const count = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  const median = count % 2 === 0 ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2 : sorted[Math.floor(count / 2)];

  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  const q25 = sorted[Math.floor(count * 0.25)];
  const q75 = sorted[Math.floor(count * 0.75)];

  return {
    count,
    sum: Number(sum.toFixed(2)),
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    min: sorted[0],
    max: sorted[count - 1],
    q25: Number(q25.toFixed(2)),
    q75: Number(q75.toFixed(2)),
  };
}

export function groupBy<T>(events: T[], keySelector: (e: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const event of events) {
    const key = keySelector(event);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(event);
  }

  return groups;
}

export function getTimeBlock(date: Date): { label: string; hour: number } {
  const hour = date.getHours();

  if (hour >= 0 && hour < 6) return { label: 'Night', hour };
  if (hour >= 6 && hour < 12) return { label: 'Morning', hour };
  if (hour >= 12 && hour < 17) return { label: 'Afternoon', hour };
  if (hour >= 17 && hour < 21) return { label: 'Evening', hour };
  return { label: 'Late', hour };
}

export function getPercentile(values: number[], value: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const rank = sorted.filter((v) => v <= value).length;
  return Number(((rank / sorted.length) * 100).toFixed(1));
}

export function pearsonCorrelation(x: number[], y: number[]): number | null {
  if (x.length < 2 || x.length !== y.length) return null;

  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let sumXY = 0,
    sumX2 = 0,
    sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    sumXY += dx * dy;
    sumX2 += dx * dx;
    sumY2 += dy * dy;
  }

  const denominator = Math.sqrt(sumX2 * sumY2);
  if (denominator === 0) return null;

  return Number((sumXY / denominator).toFixed(3));
}

export function detectOutliers(values: number[], multiplier: number = 1.5): number[] {
  if (values.length < 4) return [];

  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;

  const lower = q1 - multiplier * iqr;
  const upper = q3 + multiplier * iqr;

  return values
    .map((v, i) => (v < lower || v > upper ? i : -1))
    .filter((i) => i !== -1);
}

export function exponentialMovingAverage(values: number[], alpha: number = 0.3): number[] {
  if (values.length === 0) return [];

  const ema: number[] = [values[0]];

  for (let i = 1; i < values.length; i++) {
    const nextEMA = alpha * values[i] + (1 - alpha) * ema[i - 1];
    ema.push(Number(nextEMA.toFixed(2)));
  }

  return ema;
}
