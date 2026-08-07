"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectTrend = exports.movingMinimum = exports.movingMaximum = exports.simpleMovingAverage = exports.clamp = exports.bucketValue = exports.isAnomaly = exports.calculateZScore = exports.getTrendEmoji = exports.formatMetric = exports.scoreToColor = exports.scoreToRating = exports.daysAgo = exports.endOfDay = exports.startOfDay = exports.daysBetween = exports.calculateStdDev = exports.calculateMedian = exports.calculateAverage = exports.calculatePercentageChange = exports.calculateFailureRate = exports.calculateSuccessRate = exports.exponentialMovingAverage = exports.detectOutliers = exports.pearsonCorrelation = exports.getPercentile = exports.getTimeBlock = exports.groupBy = exports.computeMetrics = exports.filterByDateRange = exports.generateTimeWindows = exports.normalizeBehavioralEvents = exports.analyzeByTimeOfDay = exports.analyzeTaskTypes = exports.generateBehavioralInsights = exports.analyzeBehavior = exports.normalizeDecisions = exports.computeDecisionQualityScore = exports.detectRiskAlerts = exports.analyzeDecisionPatterns = exports.generateExecutiveSummary = exports.runComprehensiveAnalytics = void 0;
// Core orchestration
var analyticsOrchestrator_1 = require("./analyticsOrchestrator");
Object.defineProperty(exports, "runComprehensiveAnalytics", { enumerable: true, get: function () { return analyticsOrchestrator_1.runComprehensiveAnalytics; } });
Object.defineProperty(exports, "generateExecutiveSummary", { enumerable: true, get: function () { return analyticsOrchestrator_1.generateExecutiveSummary; } });
// Decision analysis
var decisionAnalyzer_1 = require("./decisionAnalyzer");
Object.defineProperty(exports, "analyzeDecisionPatterns", { enumerable: true, get: function () { return decisionAnalyzer_1.analyzeDecisionPatterns; } });
Object.defineProperty(exports, "detectRiskAlerts", { enumerable: true, get: function () { return decisionAnalyzer_1.detectRiskAlerts; } });
Object.defineProperty(exports, "computeDecisionQualityScore", { enumerable: true, get: function () { return decisionAnalyzer_1.computeDecisionQualityScore; } });
Object.defineProperty(exports, "normalizeDecisions", { enumerable: true, get: function () { return decisionAnalyzer_1.normalizeDecisions; } });
// Behavioral analysis
var behavioralAnalyzer_1 = require("./behavioralAnalyzer");
Object.defineProperty(exports, "analyzeBehavior", { enumerable: true, get: function () { return behavioralAnalyzer_1.analyzeBehavior; } });
Object.defineProperty(exports, "generateBehavioralInsights", { enumerable: true, get: function () { return behavioralAnalyzer_1.generateBehavioralInsights; } });
Object.defineProperty(exports, "analyzeTaskTypes", { enumerable: true, get: function () { return behavioralAnalyzer_1.analyzeTaskTypes; } });
Object.defineProperty(exports, "analyzeByTimeOfDay", { enumerable: true, get: function () { return behavioralAnalyzer_1.analyzeByTimeOfDay; } });
Object.defineProperty(exports, "normalizeBehavioralEvents", { enumerable: true, get: function () { return behavioralAnalyzer_1.normalizeBehavioralEvents; } });
// Data aggregation utilities
var dataAggregator_1 = require("./dataAggregator");
Object.defineProperty(exports, "generateTimeWindows", { enumerable: true, get: function () { return dataAggregator_1.generateTimeWindows; } });
Object.defineProperty(exports, "filterByDateRange", { enumerable: true, get: function () { return dataAggregator_1.filterByDateRange; } });
Object.defineProperty(exports, "computeMetrics", { enumerable: true, get: function () { return dataAggregator_1.computeMetrics; } });
Object.defineProperty(exports, "groupBy", { enumerable: true, get: function () { return dataAggregator_1.groupBy; } });
Object.defineProperty(exports, "getTimeBlock", { enumerable: true, get: function () { return dataAggregator_1.getTimeBlock; } });
Object.defineProperty(exports, "getPercentile", { enumerable: true, get: function () { return dataAggregator_1.getPercentile; } });
Object.defineProperty(exports, "pearsonCorrelation", { enumerable: true, get: function () { return dataAggregator_1.pearsonCorrelation; } });
Object.defineProperty(exports, "detectOutliers", { enumerable: true, get: function () { return dataAggregator_1.detectOutliers; } });
Object.defineProperty(exports, "exponentialMovingAverage", { enumerable: true, get: function () { return dataAggregator_1.exponentialMovingAverage; } });
// Analytics utilities
var analyticsUtils_1 = require("./analyticsUtils");
Object.defineProperty(exports, "calculateSuccessRate", { enumerable: true, get: function () { return analyticsUtils_1.calculateSuccessRate; } });
Object.defineProperty(exports, "calculateFailureRate", { enumerable: true, get: function () { return analyticsUtils_1.calculateFailureRate; } });
Object.defineProperty(exports, "calculatePercentageChange", { enumerable: true, get: function () { return analyticsUtils_1.calculatePercentageChange; } });
Object.defineProperty(exports, "calculateAverage", { enumerable: true, get: function () { return analyticsUtils_1.calculateAverage; } });
Object.defineProperty(exports, "calculateMedian", { enumerable: true, get: function () { return analyticsUtils_1.calculateMedian; } });
Object.defineProperty(exports, "calculateStdDev", { enumerable: true, get: function () { return analyticsUtils_1.calculateStdDev; } });
Object.defineProperty(exports, "daysBetween", { enumerable: true, get: function () { return analyticsUtils_1.daysBetween; } });
Object.defineProperty(exports, "startOfDay", { enumerable: true, get: function () { return analyticsUtils_1.startOfDay; } });
Object.defineProperty(exports, "endOfDay", { enumerable: true, get: function () { return analyticsUtils_1.endOfDay; } });
Object.defineProperty(exports, "daysAgo", { enumerable: true, get: function () { return analyticsUtils_1.daysAgo; } });
Object.defineProperty(exports, "scoreToRating", { enumerable: true, get: function () { return analyticsUtils_1.scoreToRating; } });
Object.defineProperty(exports, "scoreToColor", { enumerable: true, get: function () { return analyticsUtils_1.scoreToColor; } });
Object.defineProperty(exports, "formatMetric", { enumerable: true, get: function () { return analyticsUtils_1.formatMetric; } });
Object.defineProperty(exports, "getTrendEmoji", { enumerable: true, get: function () { return analyticsUtils_1.getTrendEmoji; } });
Object.defineProperty(exports, "calculateZScore", { enumerable: true, get: function () { return analyticsUtils_1.calculateZScore; } });
Object.defineProperty(exports, "isAnomaly", { enumerable: true, get: function () { return analyticsUtils_1.isAnomaly; } });
Object.defineProperty(exports, "bucketValue", { enumerable: true, get: function () { return analyticsUtils_1.bucketValue; } });
Object.defineProperty(exports, "clamp", { enumerable: true, get: function () { return analyticsUtils_1.clamp; } });
Object.defineProperty(exports, "simpleMovingAverage", { enumerable: true, get: function () { return analyticsUtils_1.simpleMovingAverage; } });
Object.defineProperty(exports, "movingMaximum", { enumerable: true, get: function () { return analyticsUtils_1.movingMaximum; } });
Object.defineProperty(exports, "movingMinimum", { enumerable: true, get: function () { return analyticsUtils_1.movingMinimum; } });
Object.defineProperty(exports, "detectTrend", { enumerable: true, get: function () { return analyticsUtils_1.detectTrend; } });
