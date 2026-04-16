export const runtime = "node";
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { evaluateRisk, RiskEvaluationInput } from '../../lib/riskEngine.ts';

const prisma = new PrismaClient();

  try {
    const { action, context, description, tags, override, userReasoning } = await req.json();
    // Fetch past decisions for context-aware risk evaluation
    const pastDecisions = await prisma.decisionLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    // Evaluate risk using advanced engine
    const riskResult = evaluateRisk({ action, context, override, userReasoning }, pastDecisions);
    // Determine riskLevel
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskResult.riskScore >= 70) riskLevel = 'high';
    else if (riskResult.riskScore >= 40) riskLevel = 'medium';
    // Store in Prisma
    const decision = await prisma.decisions.create({
      data: {
        description,
        tags,
        riskScore: riskResult.riskScore,
        riskLevel,
        explanation: JSON.stringify(riskResult.explanations),
        categoryScores: JSON.stringify(riskResult.categoryScores),
        futureSimulation: JSON.stringify(riskResult.futureSimulation),
        confidence: riskResult.confidence,
        confidenceSummary: riskResult.confidenceSummary,
        patternDrift: JSON.stringify(riskResult.patternDrift),
        override,
        userReasoning,
      },
    });
    return NextResponse.json({
      id: decision.id,
      riskScore: riskResult.riskScore,
      riskLevel,
      explanations: riskResult.explanations,
      categoryScores: riskResult.categoryScores,
      futureSimulation: riskResult.futureSimulation,
      confidence: riskResult.confidence,
      confidenceSummary: riskResult.confidenceSummary,
      patternDrift: riskResult.patternDrift,
      override,
      userReasoning,
      createdAt: decision.createdAt,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to process decision.', details: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const decisions = await prisma.decisions.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    return NextResponse.json(
      decisions.map(d => ({
        id: d.id,
        description: d.description,
        tags: d.tags,
        riskScore: d.riskScore,
        riskLevel: d.riskLevel,
        explanation: JSON.parse(d.explanation),
        createdAt: d.createdAt,
      }))
    );
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch decisions.' }, { status: 500 });
  }
}

export async function POST_EVALUATE(req: NextRequest) {
  try {
    const { action, context } = await req.json();
    // Fetch past decisions from DB
    const pastDecisions = await prisma.decisionLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    // Evaluate risk
    const riskResult = evaluateRisk({ action, context }, pastDecisions);
    // Store new decision
    const newDecision = await prisma.decisionLog.create({
      data: {
        action,
        context,
        outcome: 'pending',
        productivityDrop: context.productivity_drop || 0,
      },
    });
    return NextResponse.json({
      id: newDecision.id,
      ...riskResult,
      createdAt: newDecision.createdAt,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to evaluate decision', details: String(e) }, { status: 500 });
  }
}
