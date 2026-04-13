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
