import { DecisionLog } from '../../types';

export interface RiskEvaluationInput {
  action: string;
  context: Record<string, any>;
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
  activeRiskLoad?: number;
}

// Dummy similarity function
function similarity(a: any, b: any): number {
  // Simple context overlap
  let score = 0;
  for (const key in a) {
    if (b[key] !== undefined && a[key] === b[key]) score += 1;
  }
  return score;
}

export function evaluateRisk(
  input: RiskEvaluationInput,
  pastDecisions: DecisionLog[]
): RiskEvaluationOutput {
  // Find similar past decisions
  const similar = pastDecisions
    .map(d => ({ d, sim: similarity(input.context, d.context) }))
    .filter(x => x.sim > 0)
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 5);

  let riskScore = 0;
  let warnings: string[] = [];
  let explanations: string[] = [];
  let categoryScores: Record<string, number> = {};

  // Similar past failures
  const failures = similar.filter(x => x.d.outcome !== 'success');
  if (failures.length) {
    riskScore += failures.length * 15;
    warnings.push('Similar past actions resulted in failure.');
    explanations.push('Similar decisions previously resulted in burnout or regret.');
  }

  // Sleep deficit
  if (input.context.sleep !== undefined && input.context.sleep < 6) {
    riskScore += 20;
    warnings.push('Sleep deficit detected.');
    explanations.push('You historically underperform when sleeping under 6 hours.');
    categoryScores['physical'] = 20;
  }

  // Overcommitment
  if (input.context.active_projects !== undefined && input.context.active_projects > 3) {
    riskScore += 15;
    warnings.push('Too many active projects.');
    explanations.push('Managing more than 3 active projects increases your risk.');
    categoryScores['execution'] = 15;
  }

  // Stress level
  if (input.context.stress !== undefined && input.context.stress > 7) {
    riskScore += 20;
    warnings.push('High stress level.');
    explanations.push('High stress levels are linked to poor outcomes.');
    categoryScores['emotional'] = 20;
  }

  // Emotional state
  if (input.context.emotion !== undefined && input.context.emotion === 'regret') {
    riskScore += 10;
    warnings.push('Negative emotional state.');
    explanations.push('Negative emotional state increases risk of poor decisions.');
    categoryScores['emotional'] = (categoryScores['emotional'] || 0) + 10;
  }

  // Productivity drop
  if (input.context.productivity_drop !== undefined && input.context.productivity_drop > 2) {
    riskScore += 10;
    warnings.push('Recent productivity drop.');
    explanations.push('Recent productivity drop signals increased risk.');
    categoryScores['execution'] = (categoryScores['execution'] || 0) + 10;
  }

  // Clamp risk score
  riskScore = Math.min(100, riskScore);

  // Recommended alternative (dummy)
  let recommendedAlternative = undefined;
  if (riskScore > 60) recommendedAlternative = 'Delay action or reduce workload.';

  // Explainability
  const explainability = `Risk factors: ${warnings.join(' | ')}`;

  // Confidence: number of similar events
  const confidence = similar.length;

  // Active risk load (dummy)
  const activeRiskLoad = riskScore;

  return {
    riskScore,
    warnings,
    explanations,
    recommendedAlternative,
    explainability,
    categoryScores,
    confidence,
    activeRiskLoad,
  };
}
