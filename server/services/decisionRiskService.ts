// Decision risk evaluation engine
import prisma from './prismaClient';

export interface DecisionContext {
  sleep?: number;
  stress?: 'low' | 'medium' | 'high';
  active_projects?: number;
  emotional_state?: 'stable' | 'unstable' | 'neutral';
  [key: string]: any;
}

export interface DecisionEvaluationResult {
  riskScore: number;
  warnings: string[];
  recommendedAlternative?: string;
  explainability: string[];
  categoryScores?: Record<string, number>;
  futureSimulation?: Record<string, number>;
  confidence?: string;
  activeRiskLoad?: number;
}

export async function evaluateDecisionRisk(action: string, context: DecisionContext): Promise<DecisionEvaluationResult> {
  // Query similar past decisions
  const similar = await (prisma as any).decisionLog.findMany({
    where: {
      action: { contains: action, mode: 'insensitive' },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  let riskScore = 0;
  const warnings: string[] = [];
  const explainability: string[] = [];
  let confidence = 'Low';

  // Similar past failures
  const failures = similar.filter((d: any) => d.outcome === 'burnout' || d.outcome === 'failure' || d.outcome === 'delay');
  if (failures.length) {
    riskScore += failures.length * 15;
    explainability.push(`You have failed similar actions ${failures.length} times recently.`);
    warnings.push('High risk due to similar past failures.');
    confidence = failures.length >= 5 ? 'High' : failures.length >= 2 ? 'Medium' : 'Low';
  }

  // Sleep deficit
  if (context.sleep !== undefined && context.sleep < 5) {
    riskScore += 15;
    explainability.push('Sleep < 5 hours increases risk.');
    warnings.push('Sleep deficit detected.');
  }

  // Overcommitment
  if (context.active_projects !== undefined && context.active_projects > 3) {
    riskScore += 20;
    explainability.push('Managing more than 3 active projects increases risk.');
    warnings.push('Overcommitment detected.');
  }

  // Stress level
  if (context.stress === 'high') {
    riskScore += 10;
    explainability.push('High stress increases risk.');
    warnings.push('High stress detected.');
  }

  // Emotional state
  if (context.emotional_state === 'unstable') {
    riskScore += 10;
    explainability.push('Emotional instability increases risk.');
    warnings.push('Emotional instability detected.');
  }

  // Clamp riskScore
  riskScore = Math.min(100, riskScore);

  // Recommended alternative
  let recommendedAlternative: string | undefined;
  if (riskScore > 70) {
    recommendedAlternative = 'Delay action, prioritize rest, reduce workload.';
  }

  // Category scores (simple demo)
  const categoryScores = {
    financial: 20,
    emotional: context.emotional_state === 'unstable' ? 75 : 20,
    execution: riskScore,
  };

  // Future simulation (demo)
  const futureSimulation = {
    delayed_completion: riskScore > 60 ? 63 : 20,
    stress_spike: riskScore > 60 ? 48 : 15,
    abandonment: riskScore > 60 ? 32 : 10,
  };

  // Active risk load (demo)
  const activeRiskLoad = context.active_projects ? Math.min(100, context.active_projects * 20) : 0;

  return {
    riskScore,
    warnings,
    recommendedAlternative,
    explainability,
    categoryScores,
    futureSimulation,
    confidence,
    activeRiskLoad,
  };
}
