/**
 * Intelligence Analytics Module
 * 
 * Complete analytics engine for behavioral data aggregation and insight generation.
 * 
 * Main exports:
 * - runComprehensiveAnalytics: Main entry point for full analysis
 * - Individual analyzers for specialized analysis
 * - Utility functions for common operations
 */

// Core orchestration
export { runComprehensiveAnalytics, generateExecutiveSummary } from './analyticsOrchestrator';
export type {
  ComprehensiveAnalytics,
  Recommendation,
  AnalyticsInput,
} from './analyticsOrchestrator';

// Decision analysis
export {
  analyzeDecisionPatterns,
  detectRiskAlerts,
  computeDecisionQualityScore,
  normalizeDecisions,
} from './decisionAnalyzer';
export type {
  DecisionSnapshot,
  DecisionAnalysis,
  RiskAlert,
} from './decisionAnalyzer';

// Behavioral analysis
export {
  analyzeBehavior,
  generateBehavioralInsights,
  analyzeTaskTypes,
  analyzeByTimeOfDay,
  normalizeBehavioralEvents,
} from './behavioralAnalyzer';
export type {
  BehavioralAnalysis,
  BehavioralInsight,
  TaskTypeStats,
  TimeBlockAnalysis,
} from './behavioralAnalyzer';

// Data aggregation utilities
export {
  generateTimeWindows,
  filterByDateRange,
  computeMetrics,
  groupBy,
  getTimeBlock,
  getPercentile,
  pearsonCorrelation,
  detectOutliers,
  exponentialMovingAverage,
} from './dataAggregator';
export type {
  TimeWindow,
  AggregatedMetrics,
} from './dataAggregator';

// Analytics utilities
export {
  calculateSuccessRate,
  calculateFailureRate,
  calculatePercentageChange,
  calculateAverage,
  calculateMedian,
  calculateStdDev,
  daysBetween,
  startOfDay,
  endOfDay,
  daysAgo,
  scoreToRating,
  scoreToColor,
  formatMetric,
  getTrendEmoji,
  calculateZScore,
  isAnomaly,
  bucketValue,
  clamp,
  simpleMovingAverage,
  movingMaximum,
  movingMinimum,
  detectTrend,
} from './analyticsUtils';
