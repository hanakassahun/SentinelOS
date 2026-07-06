// RiskEvaluationInput for risk engine
export interface RiskEvaluationInput {
  action: string;
  context: Record<string, any>;
  override?: boolean;
  userReasoning?: string;
}
// DecisionLog type for risk engine
export interface DecisionLog {
  id: string;
  context: Record<string, any>;
  outcome: 'success' | 'fail' | 'burnout' | 'regret' | string;
  timestamp?: string;
  [key: string]: any;
}

export interface RiskEvaluationOutput {
  riskScore: number;
  warnings: string[];
  explanations: string[];
  recommendedAlternative?: string;
  explainability: string;
  categoryScores?: Record<string, number>;
  futureSimulation?: any;
  confidence?: number;
  confidenceSummary?: string;
  activeRiskLoad?: number;
  patternDrift?: any;
}
export enum BehaviorType {
  ENERGY = 'ENERGY',
  MOOD = 'MOOD',
}

export type Rating = 1|2|3|4|5|6|7|8|9|10;

export type SemanticRange = 'drained' | 'stable' | 'energized' | 'peak';

export interface Tag {
  id?: string;
  name: string;
  category?: 'Location' | 'State' | 'Activity';
}

export interface LogEntry {
  id: string;
  userId: string;
  behaviorType: BehaviorType;
  value: Rating;
  expectedValue?: Rating;
  timestamp: string; // ISO timestamp for the logged moment
  timezone?: string; // optional IANA timezone identifier
  tags?: string[]; // array of tag ids or names (normalized in DB)
  note?: string;
  createdAt: string;
}

// Backwards-compatible event shape (deprecated for new logs)
export interface BehavioralEvent {
  id: string;
  userId: string;
  taskType?: string;
  plannedTime?: string;
  executedTime?: string;
  energyLevel?: Rating;
  moodLevel?: Rating;
  difficulty?: number;
  outcome?: 'success' | 'fail';
  tags?: string[];
  note?: string;
  createdAt: string;
}

export interface Insight {
  id: string;
  text: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  userId: string;
  timestamp: string;
  data: T;
}

export type AnalyticsResponse<T> = ApiResponse<T>;

export interface RiskAlert {
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  reason: string;
  recommendation: string;
  confidence: number;
  affectedDecisions: number[];
}

export interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'decision' | 'behavioral' | 'timing' | 'wellness';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: string;
  timeframe: string;
}

export interface DecisionAnalysis {
  totalDecisions: number;
  avgRiskScore: number;
  medianRiskScore: number;
  riskDistribution: { low: number; medium: number; high: number };
  riskTrend: number;
  highestRiskPeriod?: {
    startDate: string;
    endDate: string;
    avgRiskScore: number;
    decisionCount: number;
  };
  riskDaysStreak?: number;
  decisionMomentum?: 'improving' | 'declining' | 'stable';
}

export interface BehavioralAnalysis {
  totalEvents: number;
  overallSuccessRate: number;
  overallFailureRate: number;
  taskTypeStats: Array<{
    taskType: string;
    totalAttempts: number;
    successes: number;
    failures: number;
    successRate: number;
    failureRate: number;
    avgEnergy?: number;
    avgMood?: number;
    avgDifficulty?: number;
  }>;
  timeBlockAnalysis: Array<{
    label: string;
    totalAttempts: number;
    successes: number;
    failures: number;
    successRate: number;
    avgEnergy?: number;
    avgMood?: number;
    consistency: number;
  }>;
  bestPerformingTimeBlock?: {
    label: string;
    totalAttempts: number;
    successes: number;
    failures: number;
    successRate: number;
    avgEnergy?: number;
    avgMood?: number;
    consistency: number;
  };
  worstPerformingTimeBlock?: {
    label: string;
    totalAttempts: number;
    successes: number;
    failures: number;
    successRate: number;
    avgEnergy?: number;
    avgMood?: number;
    consistency: number;
  };
  energyOutcomeCorrelation?: number;
  moodOutcomeCorrelation?: number;
  consistencyScore: number;
}

export interface ComprehensiveAnalyticsData {
  timestamp: string;
  userId: string;
  decisionAnalysis: DecisionAnalysis;
  decisionQualityScore: number;
  riskAlerts: RiskAlert[];
  behavioralAnalysis: BehavioralAnalysis;
  behavioralInsights: Array<{
    type: 'strength' | 'weakness' | 'pattern' | 'opportunity';
    title: string;
    description: string;
    metric: number;
    priority: 'high' | 'medium' | 'low';
    actionable: string;
  }>;
  synthesizedRecommendations: Recommendation[];
  overallHealthScore: number;
}

export interface DecisionMetricsData {
  decisionAnalysis: DecisionAnalysis;
  riskAlerts: RiskAlert[];
  qualityScore: number;
  metricsCount: number;
}

export interface BehaviorMetricsData {
  behavioralAnalysis: BehavioralAnalysis;
  insights: Array<{
    type: 'strength' | 'weakness' | 'pattern' | 'opportunity';
    title: string;
    description: string;
    metric: number;
    priority: 'high' | 'medium' | 'low';
    actionable: string;
  }>;
  metricsCount: number;
}

export interface HealthScoreData {
  healthScore: number;
  decisionQualityScore: number;
  successRate: number;
  riskAlertCount: number;
  criticalAlertsCount: number;
  topRecommendation?: Recommendation | null;
}
