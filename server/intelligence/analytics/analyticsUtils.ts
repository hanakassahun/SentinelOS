/**
 * Analytics Utilities and Helpers
 * 
 * Common utilities for analytics operations:
 * - Performance metrics calculation
 * - Statistical computations
 * - Date/time utilities
 * - Scoring and rating functions
 */

/**
 * Calculate success rate percentage
 * @param successes Number of successes
 * @param total Total attempts
 * @returns Success rate (0-100)
 */
export function calculateSuccessRate(successes: number, total: number): number {
  if (total === 0) return 0;
  return Number(((successes / total) * 100).toFixed(1));
}

/**
 * Calculate failure rate percentage
 * @param failures Number of failures
 * @param total Total attempts
 * @returns Failure rate (0-100)
 */
export function calculateFailureRate(failures: number, total: number): number {
  if (total === 0) return 0;
  return Number(((failures / total) * 100).toFixed(1));
}

/**
 * Calculate percentage change between two values
 * @param oldValue Previous value
 * @param newValue Current value
 * @returns Percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return Number((((newValue - oldValue) / oldValue) * 100).toFixed(1));
}

/**
 * Calculate average of numeric array
 * @param values Array of numbers
 * @returns Average value
 */
export function calculateAverage(values: number[]): number | null {
  if (values.length === 0) return null;
  return Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
}

/**
 * Calculate median of numeric array
 * @param values Array of numbers
 * @returns Median value
 */
export function calculateMedian(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculate standard deviation
 * @param values Array of numbers
 * @returns Standard deviation
 */
export function calculateStdDev(values: number[]): number | null {
  const avg = calculateAverage(values);
  if (avg === null) return null;

  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  return Number(Math.sqrt(variance).toFixed(2));
}

/**
 * Get days between two dates
 * @param start Start date
 * @param end End date
 * @returns Number of days
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay);
}

/**
 * Get start of day (midnight)
 * @param date Date to normalize
 * @returns Start of day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 * @param date Date to normalize
 * @returns End of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get date N days ago
 * @param days Number of days
 * @returns Date from N days ago
 */
export function daysAgo(days: number): Date {
  const result = new Date();
  result.setDate(result.getDate() - days);
  return result;
}

/**
 * Convert score to rating
 * @param score Score (0-100)
 * @returns Rating (A+, A, B+, etc.)
 */
export function scoreToRating(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 50) return 'C-';
  if (score >= 40) return 'D';
  return 'F';
}

/**
 * Get color for performance level
 * @param score Score (0-100)
 * @returns Color hex code
 */
export function scoreToColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#eab308'; // yellow
  if (score >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
}

/**
 * Format metric value with units
 * @param value Numeric value
 * @param unit Unit suffix
 * @returns Formatted string
 */
export function formatMetric(value: number, unit: string = ''): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value}${unit}`;
}

/**
 * Get trend emoji
 * @param value Numeric value (positive = up, negative = down)
 * @returns Emoji
 */
export function getTrendEmoji(value: number): string {
  if (value > 10) return '📈';
  if (value > 0) return '↗️';
  if (value < -10) return '📉';
  if (value < 0) return '↘️';
  return '→';
}

/**
 * Calculate Z-score for anomaly detection
 * @param value Value to check
 * @param mean Mean of distribution
 * @param stdDev Standard deviation
 * @returns Z-score
 */
export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return Number(((value - mean) / stdDev).toFixed(2));
}

/**
 * Determine if value is anomalous (|z| > 2)
 * @param value Value to check
 * @param mean Mean of distribution
 * @param stdDev Standard deviation
 * @returns True if anomalous
 */
export function isAnomaly(value: number, mean: number, stdDev: number): boolean {
  const zScore = calculateZScore(value, mean, stdDev);
  return Math.abs(zScore) > 2;
}

/**
 * Bucket continuous value into discrete categories
 * @param value Value to bucket
 * @param ranges Array of [threshold, label] tuples
 * @returns Label for bucket
 */
export function bucketValue(value: number, ranges: Array<[number, string]>): string {
  for (const [threshold, label] of ranges) {
    if (value <= threshold) return label;
  }
  return ranges[ranges.length - 1][1];
}

/**
 * Clamp value between min and max
 * @param value Value to clamp
 * @param min Minimum
 * @param max Maximum
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Smooth array values using simple moving average
 * @param values Array of values
 * @param windowSize Window size for averaging
 * @returns Smoothed array
 */
export function simpleMovingAverage(values: number[], windowSize: number = 3): number[] {
  if (windowSize < 1 || values.length === 0) return values;

  const smoothed: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(values.length, i + Math.ceil(windowSize / 2));
    const window = values.slice(start, end);
    const avg = window.reduce((a, b) => a + b, 0) / window.length;
    smoothed.push(Number(avg.toFixed(2)));
  }
  return smoothed;
}

/**
 * Calculate moving maximum
 * @param values Array of values
 * @param windowSize Window size
 * @returns Array of moving maximums
 */
export function movingMaximum(values: number[], windowSize: number = 3): number[] {
  if (windowSize < 1 || values.length === 0) return values;

  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(values.length, i + Math.ceil(windowSize / 2));
    const window = values.slice(start, end);
    result.push(Math.max(...window));
  }
  return result;
}

/**
 * Calculate moving minimum
 * @param values Array of values
 * @param windowSize Window size
 * @returns Array of moving minimums
 */
export function movingMinimum(values: number[], windowSize: number = 3): number[] {
  if (windowSize < 1 || values.length === 0) return values;

  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(values.length, i + Math.ceil(windowSize / 2));
    const window = values.slice(start, end);
    result.push(Math.min(...window));
  }
  return result;
}

/**
 * Detect trend direction using linear regression
 * @param values Array of values in time order
 * @returns Trend slope (positive = up, negative = down)
 */
export function detectTrend(values: number[]): number {
  if (values.length < 2) return 0;

  const n = values.length;
  const sumX = (n * (n + 1)) / 2;
  const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, val, i) => sum + (i + 1) * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = n * sumX2 - sumX * sumX;

  if (denominator === 0) return 0;
  const slope = numerator / denominator;

  return Number(slope.toFixed(3));
}
