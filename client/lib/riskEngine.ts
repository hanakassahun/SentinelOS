// Confidence score summary
function getConfidenceSummary(similarCount: number): string {
  if (similarCount === 0) return 'No similar events found. Low confidence.';
  if (similarCount < 3) return `Few similar events found (${similarCount}). Moderate confidence.`;
  return `Several similar events found (${similarCount}). High confidence in risk estimate.`;
}
// Pattern Drift Detection: compare current context to past "bad" phases
function detectPatternDrift(currentContext: Record<string, any>, pastDecisions: DecisionLog[]): { driftScore: number; driftDetected: boolean; summary: string } {
  // Define "bad" phases as past decisions with negative outcome
  const badPhases = pastDecisions.filter(d => d.outcome !== 'success');
  if (badPhases.length === 0) {
    return { driftScore: 0, driftDetected: false, summary: 'No bad phases in history.' };
  }
  // Compare current context to each bad phase context using similarity
  let maxDrift = 0;
  for (const bad of badPhases) {
    const sim = similarity(currentContext, bad.context);
    if (sim > maxDrift) maxDrift = sim;
  }
  // Heuristic: if similarity to any bad phase is high (e.g., >= 3), flag drift
  const driftDetected = maxDrift >= 3;
  const summary = driftDetected
    ? `Current context is similar to a past bad phase (similarity: ${maxDrift}). Pattern drift detected!`
    : 'No significant pattern drift detected.';
  return { driftScore: maxDrift, driftDetected, summary };
}
// Heuristic-based future self simulation
function simulateFutureOutcome(riskScore: number, context: Record<string, any>): { successProb: number; failProb: number; neutralProb: number; summary: string } {
  // Simple heuristic: higher riskScore means lower success probability
  // You can expand this logic with more context features as needed
  let successProb = Math.max(0, 1 - riskScore / 100);
  let failProb = Math.min(1, riskScore / 100 * 0.8); // up to 80% fail at max risk
  let neutralProb = 1 - successProb - failProb;
  // Clamp
  successProb = Math.max(0, Math.min(1, successProb));
  failProb = Math.max(0, Math.min(1, failProb));
  neutralProb = Math.max(0, Math.min(1, neutralProb));
  // Human-readable summary
  let summary = `If you proceed, estimated chance of success: ${(successProb*100).toFixed(0)}%, failure: ${(failProb*100).toFixed(0)}%, neutral: ${(neutralProb*100).toFixed(0)}%.`;
  return { successProb, failProb, neutralProb, summary };
}
import { DecisionLog, RiskEvaluationOutput, RiskEvaluationInput } from '../types';






// Dummy similarity function
function similarity(a: any, b: any): number {
  // Simple context overlap
  let score = 0;
  for (const key in a) {
    if (b[key] !== undefined && a[key] === b[key]) score += 1;
  }
  return score;
}


function getSleepExplanation(sleep: number | undefined): string | undefined {
  if (sleep !== undefined && sleep < 6) {
    return 'You historically underperform when sleeping under 6 hours.';
  }
  return undefined;
}

function getActiveProjectsExplanation(activeProjects: number | undefined): string | undefined {
  if (activeProjects !== undefined && activeProjects > 3) {
    return 'Managing more than 3 active projects increases your risk.';
  }
  return undefined;
}

function getStressExplanation(stress: number | undefined): string | undefined {
  if (stress !== undefined && stress > 7) {
    return 'High stress levels are linked to poor outcomes.';
  }
  return undefined;
}

function getEmotionExplanation(emotion: string | undefined): string | undefined {
  if (emotion !== undefined && emotion === 'regret') {
    return 'Negative emotional state increases risk of poor decisions.';
  }
  return undefined;
}

function getProductivityDropExplanation(productivityDrop: number | undefined): string | undefined {
  if (productivityDrop !== undefined && productivityDrop > 2) {
    return 'Recent productivity drop signals increased risk.';
  }
  return undefined;
}

function getSimilarFailuresExplanation(hasFailures: boolean): string | undefined {
  if (hasFailures) {
    return 'Similar decisions previously resulted in burnout or regret.';
  }
  return undefined;
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
  // Modular category profiling
  let categoryScores: Record<string, number> = {
    physical: 0,
    execution: 0,
    emotional: 0,
    // Add more categories as needed
  };

  // Similar past failures
  const failures = similar.filter(x => x.d.outcome !== 'success');
  if (failures.length) {
    riskScore += failures.length * 15;
    warnings.push('Similar past actions resulted in failure.');
    const exp = getSimilarFailuresExplanation(true);
    if (exp) explanations.push(exp);
    // Assign to a general or custom category if desired
    categoryScores['execution'] += failures.length * 15;
  }

  // Sleep deficit
  if (input.context.sleep !== undefined && input.context.sleep < 6) {
    riskScore += 20;
    warnings.push('Sleep deficit detected.');
    const exp = getSleepExplanation(input.context.sleep);
    if (exp) explanations.push(exp);
    categoryScores['physical'] += 20;
  }

  // Overcommitment
  if (input.context.active_projects !== undefined && input.context.active_projects > 3) {
    riskScore += 15;
    warnings.push('Too many active projects.');
    const exp = getActiveProjectsExplanation(input.context.active_projects);
    if (exp) explanations.push(exp);
    categoryScores['execution'] += 15;
  }

  // Stress level
  if (input.context.stress !== undefined && input.context.stress > 7) {
    riskScore += 20;
    warnings.push('High stress level.');
    const exp = getStressExplanation(input.context.stress);
    if (exp) explanations.push(exp);
    categoryScores['emotional'] += 20;
  }

  // Emotional state
  if (input.context.emotion !== undefined && input.context.emotion === 'regret') {
    riskScore += 10;
    warnings.push('Negative emotional state.');
    const exp = getEmotionExplanation(input.context.emotion);
    if (exp) explanations.push(exp);
    categoryScores['emotional'] += 10;
  }

  // Productivity drop
  if (input.context.productivity_drop !== undefined && input.context.productivity_drop > 2) {
    riskScore += 10;
    warnings.push('Recent productivity drop.');
    const exp = getProductivityDropExplanation(input.context.productivity_drop);
    if (exp) explanations.push(exp);
    categoryScores['execution'] += 10;
  }

  // Clamp risk score
  riskScore = Math.min(100, riskScore);
  // Remove zero categories for cleaner output
  Object.keys(categoryScores).forEach(cat => {
    if (categoryScores[cat] === 0) delete categoryScores[cat];
  });

  // Future self simulation (heuristic-based outcome probabilities)
  const futureSimulation = simulateFutureOutcome(riskScore, input.context);

  // Pattern drift detection
  const patternDrift = detectPatternDrift(input.context, pastDecisions);

  // Recommended alternative (dummy)
  let recommendedAlternative = undefined;
  if (riskScore > 60) recommendedAlternative = 'Delay action or reduce workload.';

  // Explainability
  const explainability = `Risk factors: ${warnings.join(' | ')}`;

  // Confidence: number of similar events
  const confidence = similar.length;
  const confidenceSummary = getConfidenceSummary(confidence);

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
    confidenceSummary,
    activeRiskLoad,
    futureSimulation,
    patternDrift,
  };
}
