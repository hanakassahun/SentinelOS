import { evaluateRisk } from '../lib/riskEngine';
import { RiskEvaluationInput, RiskEvaluationOutput, DecisionLog } from '../types';
import { PrismaClient } from '../../../node_modules/.prisma/client';

const prisma = new PrismaClient();

/**
 * Evaluates decision risk given context and action.
 * Loads relevant history, computes risk, and returns structured result.
 */

export async function evaluateDecisionRisk(context: Record<string, any>, action: string): Promise<RiskEvaluationOutput> {
  // Load relevant history (last 50 decisions)
  // Use the correct Prisma model name (DecisionLog or decisionLog)
  const pastDecisions = await prisma.decisionLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  // Compute risk
  const riskResult = evaluateRisk({ action, context }, pastDecisions as DecisionLog[]);
  return riskResult;
}

